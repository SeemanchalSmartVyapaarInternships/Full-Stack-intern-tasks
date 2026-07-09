const { body, param, query } = require("express-validator");

const patientBodyRules = [
  body("firstName").trim().isLength({ min: 2 }).withMessage("First name is required."),
  body("lastName").trim().isLength({ min: 2 }).withMessage("Last name is required."),
  body("email").optional({ checkFalsy: true }).isEmail().normalizeEmail(),
  body("phone").trim().isLength({ min: 7 }).withMessage("Phone is required."),
  body("gender").isIn(["female", "male", "other"]),
  body("dateOfBirth").isISO8601().toDate(),
  body("bloodGroup").optional({ checkFalsy: true }).isString(),
  body("address").optional({ checkFalsy: true }).isString(),
  body("emergencyContact").optional({ checkFalsy: true }).isString(),
  body("allergies").optional({ checkFalsy: true }).isString(),
  body("medicalHistory").optional({ checkFalsy: true }).isString(),
  body("insuranceProvider").optional({ checkFalsy: true }).isString(),
  body("insuranceNumber").optional({ checkFalsy: true }).isString(),
];

const idParam = [param("id").isUUID().withMessage("Valid patient id is required.")];
const listRules = [
  query("q").optional({ checkFalsy: true }).isString(),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

module.exports = { patientBodyRules, idParam, listRules };
