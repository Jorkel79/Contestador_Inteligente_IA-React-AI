require("dotenv").config();

const mongoose = require("mongoose");
require("dotenv").config();

const Plan = require("./models/Plan");

mongoose.connect(process.env.MONGO_URI)
.then(async () => {

  console.log("Conectado a MongoDB");

  const existing = await Plan.findOne({ name: "free" });

  if (existing) {
    console.log("El plan FREE ya existe");
    process.exit();
  }

  await Plan.create({
    name: "free",
    dailyLimit: 5
  });

  console.log("Plan FREE creado correctamente");
  process.exit();

})
.catch(err => console.error(err));