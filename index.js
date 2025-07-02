import express from "express";
import connectDB from "./config/connectDB.js";
import JobModel from "./models/JobModel.js";
import {v4 as uuidv4 } from "uuid";

const app = express();
app.use(express.json());

app.post("/jobs", async (req, res) => {
  const requestId = uuidv4();

  const job = {
    request_id:requestId,
    payload: req.body,
    status: "pending",
    vendor: Math.random() > 0.5 ? "sync" : "async",
  };

  try{
    await JobModel.create(job)
  }
  catch(err){
    return res.json({status:"failed",error:err.message})
  }
  //await redis.xadd('jobs', '*', 'request_id', requestId);
  res.json({ request_id: requestId });
});

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running @ 3000`);
  });
});
