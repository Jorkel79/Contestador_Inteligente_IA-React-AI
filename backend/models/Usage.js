const mongoose = require("mongoose");

const usageSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  date: String,
  count: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Usage", usageSchema);
