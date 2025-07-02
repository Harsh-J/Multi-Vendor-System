import mongoose, { Schema } from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    request_id: {
      type: String,
      required: true,
    },
    payload: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "processing"],
      required: true,
      default: "pending",
    },
    vendor: {
      type: String,
      enum: ["sync", "async"],
      required: true,
    },
    result: { type: Object },
    error: { type: String },
  },
  { timestamps: true }
);

const JobModel = mongoose.model("Job", jobSchema);
export default JobModel;
