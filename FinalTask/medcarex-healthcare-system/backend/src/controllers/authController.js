const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { signToken } = require("../utils/token");
const { logActivity } = require("../utils/audit");
const env = require("../config/env");
const { User } = require("../models");

const safeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
});

const register = asyncHandler(async (req, res) => {
  const requestedRole = req.body.role || "patient";
  const role = requestedRole === "admin" && req.body.adminInviteCode === env.adminInviteCode
    ? "admin"
    : requestedRole === "admin"
      ? "patient"
      : requestedRole;

  const existing = await User.unscoped().findOne({ where: { email: req.body.email } });
  if (existing) throw new ApiError(409, "Email is already registered.");

  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    passwordHash: req.body.password,
    role,
  });

  await logActivity({ userId: user.id, action: "REGISTER", entity: "User", entityId: user.id });

  res.status(201).json({
    success: true,
    message: "Registration successful.",
    data: { user: safeUser(user), token: signToken(user) },
  });
});

const login = asyncHandler(async (req, res) => {
  const user = await User.scope("withPassword").findOne({ where: { email: req.body.email } });
  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new ApiError(401, "Invalid email or password.");
  }
  if (user.status !== "active") throw new ApiError(403, "User account is inactive.");

  await logActivity({ userId: user.id, action: "LOGIN", entity: "User", entityId: user.id });

  res.json({
    success: true,
    message: "Login successful.",
    data: { user: safeUser(user), token: signToken(user) },
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: safeUser(req.user) } });
});

module.exports = { register, login, me };
