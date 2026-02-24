const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  plan: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Plan"
  },
  repliesToday: {
    type: Number,
    default: 0
  },
  lastReplyDate: {
    type: String,
    default: ""
  }
});

module.exports = mongoose.model("User", userSchema);
