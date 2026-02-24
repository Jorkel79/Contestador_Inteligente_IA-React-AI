const mongoose = require("mongoose");

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

module.exports = mongoose.model("Reply", replySchema);
