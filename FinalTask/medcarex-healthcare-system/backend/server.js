const http = require("http");
const app = require("./src/app");
const { sequelize } = require("./src/models");
const env = require("./src/config/env");

const MAX_DB_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectWithRetry() {
  for (let attempt = 1; attempt <= MAX_DB_RETRIES; attempt += 1) {
    try {
      await sequelize.authenticate();
      await sequelize.sync();
      console.log("Database connected and models synced.");
      return;
    } catch (error) {
      console.error(`Database connection attempt ${attempt}/${MAX_DB_RETRIES} failed: ${error.message}`);
      if (attempt === MAX_DB_RETRIES) throw error;
      await wait(RETRY_DELAY_MS);
    }
  }
}

async function bootstrap() {
  try {
    env.validateRuntimeConfig();

    if (env.nodeEnv !== "test") {
      await connectWithRetry();
    }

    const server = http.createServer(app);

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${env.port} is already in use. Stop the existing API process or set PORT to another value.`);
        process.exit(1);
      }
      throw error;
    });

    server.listen(env.port, () => {
      console.log(`MedCareX API running on port ${env.port}`);
    });

    const shutdown = async (signal) => {
      console.log(`${signal} received. Closing MedCareX API.`);
      server.close(async () => {
        await sequelize.close();
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Unable to start MedCareX API:", error);
    process.exit(1);
  }
}

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

bootstrap();
