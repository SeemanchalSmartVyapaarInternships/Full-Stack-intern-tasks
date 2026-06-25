require("dotenv").config();
const app = require("./src/app");
const sequelize = require("./src/config/database");
const { User } = require("./src/models");

const PORT = process.env.PORT || 8000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    await sequelize.sync({ alter: true });
    console.log("Models synced with database.");

    if (process.env.ADMIN_EMAIL) {
      const adminUser = await User.findOne({ where: { email: process.env.ADMIN_EMAIL } });
      if (adminUser && adminUser.role !== "admin") {
        adminUser.role = "admin";
        await adminUser.save();
        console.log(`Admin role assigned to ${process.env.ADMIN_EMAIL}`);
      }
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

start();
