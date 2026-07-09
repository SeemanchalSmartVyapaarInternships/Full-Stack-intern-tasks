const { body, param, query } = require("express-validator");

const departmentRules = [
  body("name").trim().isLength({ min: 2 }),
  body("code").trim().isLength({ min: 2, max: 20 }),
  body("description").optional({ checkFalsy: true }).isString(),
];

const doctorRules = [
  body("userId").optional({ checkFalsy: true }).isUUID(),
  body("name").if(body("userId").not().exists()).trim().isLength({ min: 2 }),
  body("email").if(body("userId").not().exists()).isEmail().normalizeEmail(),
  body("password").if(body("userId").not().exists()).isStrongPassword({ minLength: 8, minNumbers: 1, minSymbols: 1 }),
  body("departmentId").isUUID(),
  body("specialization").trim().isLength({ min: 2 }),
  body("licenseNumber").trim().isLength({ min: 3 }),
  body("phone").optional({ checkFalsy: true }).isString(),
  body("experienceYears").optional().isInt({ min: 0, max: 70 }),
  body("consultationFee").optional().isFloat({ min: 0 }),
  body("availability").optional().isObject(),
  body("status").optional().isIn(["active", "inactive"]),
];

const doctorUpdateRules = [
  body("departmentId").optional().isUUID(),
  body("specialization").optional().trim().isLength({ min: 2 }),
  body("licenseNumber").optional().trim().isLength({ min: 3 }),
  body("phone").optional({ checkFalsy: true }).isString(),
  body("experienceYears").optional().isInt({ min: 0, max: 70 }),
  body("consultationFee").optional().isFloat({ min: 0 }),
  body("availability").optional().isObject(),
  body("status").optional().isIn(["active", "inactive"]),
];

const idParam = [param("id").isUUID()];
const listRules = [query("departmentId").optional().isUUID(), query("q").optional().isString()];

module.exports = { departmentRules, doctorRules, doctorUpdateRules, idParam, listRules };
