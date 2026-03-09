import cron from "node-cron";
import Usage from "../models/Usage.js";

cron.schedule("0 0 * * *", async () => {
  try {

    const today = new Date().toISOString().slice(0, 10);

    await Usage.deleteMany({
      date: { $lt: today }
    });

    console.log("🧹 Uso diario reseteado");

  } catch (error) {
    console.error("Error reseteando usage:", error);
  }
});