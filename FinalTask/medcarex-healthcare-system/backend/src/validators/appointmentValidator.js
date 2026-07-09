const { body, param, query } = require("express-validator");

const appointmentRules = [
  body("patientId").isUUID(),
  body("doctorId").isUUID(),
  body("scheduledAt").isISO8601().toDate(),
  body("durationMinutes").optional().isInt({ min: 10, max: 240 }),
  body("reason").trim().isLength({ min: 2 }),
  body("notes").optional({ checkFalsy: true }).isString(),
];

const appointmentUpdateRules = [
  body("scheduledAt").optional().isISO8601().toDate(),
  body("durationMinutes").optional().isInt({ min: 10, max: 240 }),
  body("status").optional().isIn(["booked", "completed", "cancelled", "no_show", "rescheduled"]),
  body("reason").optional().trim().isLength({ min: 2 }),
  body("notes").optional({ checkFalsy: true }).isString(),
];

const idParam = [param("id").isUUID()];
const historyRules = [
  query("patientId").optional().isUUID(),
  query("doctorId").optional().isUUID(),
  query("status").optional().isIn(["booked", "completed", "cancelled", "no_show", "rescheduled"]),
];

module.exports = { appointmentRules, appointmentUpdateRules, idParam, historyRules };
