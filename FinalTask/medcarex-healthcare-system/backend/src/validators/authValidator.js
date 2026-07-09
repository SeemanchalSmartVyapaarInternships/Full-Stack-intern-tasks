const { body } = require("express-validator");

const registerRules = [
  body("name").trim().isLength({ min: 2 }).withMessage("Name is required."),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required."),
  body("password").isStrongPassword({ minLength: 8, minNumbers: 1, minSymbols: 1 })
    .withMessage("Password must be at least 8 characters and include a number and symbol."),
  body("role").optional().isIn(["patient", "doctor", "receptionist", "nurse", "admin"]),
  body("adminInviteCode").optional().isString(),
];

const loginRules = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required."),
  body("password").notEmpty().withMessage("Password is required."),
];

module.exports = { registerRules, loginRules };
