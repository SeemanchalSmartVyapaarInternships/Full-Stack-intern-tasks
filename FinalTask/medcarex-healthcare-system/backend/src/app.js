const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const env = require("./config/env");
const { sequelize } = require("./models");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use((req, res, next) => {
  req.id = req.headers["x-request-id"] || crypto.randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
});
app.use(cors({
  origin: env.clientUrl,
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use("/api/auth", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.get("/health", (_req, res) => {
  res.json({ success: true, service: "medcarex-api", status: "healthy" });
});

app.get("/ready", async (_req, res, next) => {
  try {
    await sequelize.authenticate();
    res.json({ success: true, service: "medcarex-api", database: "connected" });
  } catch (error) {
    error.statusCode = 503;
    next(error);
  }
});

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
