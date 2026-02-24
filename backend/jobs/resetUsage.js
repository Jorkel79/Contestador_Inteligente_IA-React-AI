const cron = require("node-cron");
const Usage = require("../models/Usage");

// Corre todos los días a medianoche
cron.schedule("0 0 * * *", async () => {
  console.log("⏳ Reseteando uso diario...");

  try {
    await Usage.updateMany({}, { count: 0 });
    console.log("✅ Uso diario reseteado");
  } catch (err) {
    console.error("❌ Error reseteando uso:", err);
  }
});