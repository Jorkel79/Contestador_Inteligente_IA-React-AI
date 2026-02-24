const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name: String,
  dailyLimit: Number
});

module.exports = mongoose.model("Plan", planSchema);