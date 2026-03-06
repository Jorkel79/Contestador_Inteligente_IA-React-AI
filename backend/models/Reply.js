import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  emailFrom: String,
  emailSubject: String,
  emailBody: String,
  aiReply: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Reply = mongoose.model("Reply", replySchema);

export default Reply;
