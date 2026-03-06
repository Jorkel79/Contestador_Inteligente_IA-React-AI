import mongoose from "mongoose";

const usageSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  date: String,
  count: {
    type: Number,
    default: 0
  }
});

const Usage = mongoose.model("Usage", usageSchema);

export default Usage;
