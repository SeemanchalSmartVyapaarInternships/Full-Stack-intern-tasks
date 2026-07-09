const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Appointment = sequelize.define("Appointment", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: "patient_id",
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: "doctor_id",
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: "scheduled_at",
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30,
    field: "duration_minutes",
  },
  status: {
    type: DataTypes.ENUM("booked", "completed", "cancelled", "no_show", "rescheduled"),
    allowNull: false,
    defaultValue: "booked",
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: "created_by",
  },
}, {
  tableName: "appointments",
});

module.exports = Appointment;
