const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  plan: {
    type: String,
    default: "free"
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
