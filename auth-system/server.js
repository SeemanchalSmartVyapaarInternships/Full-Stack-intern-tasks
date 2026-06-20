require("dotenv").config();
const app = require("./src/app");
const sequelize = require("./src/config/database");

const PORT = process.env.PORT || 8000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    await sequelize.sync({ alter: true });
    console.log("Models synced with database.");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

start();
