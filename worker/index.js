import Redis from "ioredis";
import mongoose from "mongoose";
import axios from "axios";
import JobModel from "./models/JobModel.js";
import Bottleneck from "bottleneck";

const redis = new Redis({ host: process.env.REDIS_HOST || "localhost" });
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/datafetch";
const syncVendorUrl = process.env.SYNC_VENDOR_URL || "http://localhost:3001";
const asyncVendorUrl = process.env.ASYNC_VENDOR_URL || "http://localhost:3002";

let lastRequestTime = 0;
const MIN_INTERVAL_MS = 1000;

async function rateLimit() {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_INTERVAL_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_INTERVAL_MS - timeSinceLast)
    );
  }
  lastRequestTime = Date.now();
}
const limiter = new Bottleneck({
  minTime: 1000, // 1 request per second
  maxConcurrent: 1,
});
mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("Worker connected to MongoDB");
    startWorker();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

async function startWorker() {
  while (true) {
    const entries = await redis.xread("BLOCK", 0, "STREAMS", "jobs", "$");
    if (!entries) continue;

    for (const [, messages] of entries) {
      for (const [id, fields] of messages) {
        const requestId = fields[1];
        await processJob(requestId);
        await redis.xdel("jobs", id);
      }
    }
  }
}

async function processJob(requestId) {
  try {
    const job = await JobModel.findOne({ request_id: requestId });
    if (!job) return;

    await JobModel.updateOne(
      { request_id: requestId },
      { $set: { status: "processing", updated_at: new Date() } }
    );

    const vendorUrl = job.vendor === "sync" ? syncVendorUrl : asyncVendorUrl;

    const response = await limiter.schedule(() =>
      axios.post(`${vendorUrl}/data`, {
        request_id: requestId,
        payload: job.payload,
      })
    );

    if (job.vendor === "sync") {
      const cleanedData = cleanData(response.data);
      await JobModel.updateOne(
        { request_id: requestId },
        {
          $set: {
            status: "completed",
            result: cleanedData,
            updated_at: new Date(),
          },
        }
      );
    }
  } catch (error) {
    await JobModel.updateOne(
      { request_id: requestId },
      {
        $set: {
          status: "failed",
          error: error.message,
          updated_at: new Date(),
        },
      }
    );
  }
}
function cleanData(data) {
  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      clean[key] = value
        .trim()
        .replace(
          /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
          "[email redacted]"
        );
    } else {
      clean[key] = value;
    }
  }
  return clean;
}
process.on("SIGTERM", () => {
  console.log("Worker shutting down...");
  redis.disconnect();
  mongoose.connection.close();
  process.exit(0);
});
