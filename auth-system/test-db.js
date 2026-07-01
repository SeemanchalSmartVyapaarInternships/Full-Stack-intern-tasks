const sequelize = require("./src/config/database");
const { User, Project, Task, UploadHistory, LoginHistory, TaskUpdate, ActivityLog } = require("./src/models");

async function runTest() {
  console.log("Starting backend model and association verification test...");
  try {
    await sequelize.authenticate();
    console.log("✔ Database connection authenticated.");

    // Sync database
    await sequelize.sync({ alter: true });
    console.log("✔ Sequelize models synced successfully.");

    // Create an ActivityLog entry
    const log = await ActivityLog.create({
      action: "VERIFICATION_CHECK",
      entityType: "auth",
      details: "Database models and associations integration verify run.",
      ipAddress: "127.0.0.1",
    });
    console.log("✔ Created test ActivityLog entry (ID: " + log.id + ").");

    // Create a LoginHistory entry
    const login = await LoginHistory.create({
      email: "test-login-logger@example.com",
      status: "success",
      ipAddress: "127.0.0.1",
      userAgent: "Antigravity Verification Subagent",
    });
    console.log("✔ Created test LoginHistory entry (ID: " + login.id + ").");

    // Clean up temporary verification data
    await log.destroy();
    await login.destroy();
    console.log("✔ Cleaned up test database entries.");

    console.log("\n==============================================");
    console.log("VERIFICATION TEST COMPLETED: SUCCESS");
    console.log("==============================================");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ VERIFICATION TEST FAILED:");
    console.error(err);
    process.exit(1);
  }
}

runTest();
