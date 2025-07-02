import express from "express";
import connectDB from "./config/connectDB.js";
import JobModel from "./models/JobModel.js";
import { v4 as uuidv4 } from "uuid";
import { Redis } from "ioredis";
import { MongoClient } from "mongodb";

const app = express();
app.use(express.json());

const redis = new Redis({ host: process.env.REDIS_HOST || "localhost" });
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/datafetch";
let db;

MongoClient.connect(mongoUri, { useUnifiedTopology: true })
  .then((client) => {
    db = client.db();
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error("MongoDB connection error:", err));

//POST API
app.post("/jobs", async (req, res) => {
  try {
    const requestId = uuidv4();
    const job = new JobModel({
      request_id: requestId,
      payload: req.body,
      status: "pending",
      vendor: Math.random() > 0.5 ? "sync" : "async",
    });

    await job.save();
    await redis.xadd("jobs", "*", "request_id", requestId);
    res.json({ request_id: requestId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//GET JOB API
app.get('/jobs/:requestId',async(req,res)=>{
    try {
    const job = await JobModel.findOne({ request_id: req.params.requestId });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    if (job.status === 'complete') {
      res.json({ status: 'complete', result: job.result });
    } else if (job.status === 'failed') {
      res.json({ status: 'failed', error: job.error });
    } else {
      res.json({ status: 'processing' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running @ 3000`);
  });
});
