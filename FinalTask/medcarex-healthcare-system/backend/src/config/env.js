const path = require("path");
const dotenv = require("dotenv");

const projectRoot = path.resolve(__dirname, "../../..");
const backendRoot = path.resolve(__dirname, "../..");
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

dotenv.config({ path: path.join(projectRoot, envFile) });
dotenv.config({ path: path.join(backendRoot, envFile), override: false });

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 8000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET || "dev_only_replace_this_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  adminInviteCode: process.env.ADMIN_INVITE_CODE || "",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    name: process.env.DB_NAME || "medcarex",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
};

function validateRuntimeConfig() {
  const missing = [];
  if (!env.jwtSecret || env.jwtSecret === "dev_only_replace_this_secret") {
    missing.push("JWT_SECRET");
  }
  if (!env.db.name) missing.push("DB_NAME");
  if (!env.db.user) missing.push("DB_USER");
  if (env.nodeEnv === "production" && !env.db.password) missing.push("DB_PASSWORD");

  if (missing.length > 0 && env.nodeEnv === "production") {
    throw new Error(`Missing required production environment variables: ${missing.join(", ")}`);
  }

  if (missing.length > 0) {
    console.warn(`Config warning: set ${missing.join(", ")} before production deployment.`);
  }
}

module.exports = { ...env, validateRuntimeConfig };
