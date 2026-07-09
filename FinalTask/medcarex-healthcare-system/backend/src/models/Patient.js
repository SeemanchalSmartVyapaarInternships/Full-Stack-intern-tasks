const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Patient = sequelize.define("Patient", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  patientCode: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    field: "patient_code",
  },
  firstName: {
    type: DataTypes.STRING(80),
    allowNull: false,
    field: "first_name",
  },
  lastName: {
    type: DataTypes.STRING(80),
    allowNull: false,
    field: "last_name",
  },
  email: {
    type: DataTypes.STRING(160),
    allowNull: true,
    validate: { isEmail: true },
  },
  phone: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  gender: {
    type: DataTypes.ENUM("female", "male", "other"),
    allowNull: false,
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: "date_of_birth",
  },
  bloodGroup: {
    type: DataTypes.STRING(5),
    allowNull: true,
    field: "blood_group",
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  emergencyContact: {
    type: DataTypes.STRING(120),
    allowNull: true,
    field: "emergency_contact",
  },
  allergies: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  medicalHistory: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: "medical_history",
  },
  insuranceProvider: {
    type: DataTypes.STRING(120),
    allowNull: true,
    field: "insurance_provider",
  },
  insuranceNumber: {
    type: DataTypes.STRING(120),
    allowNull: true,
    field: "insurance_number",
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: "created_by",
  },
}, {
  tableName: "patients",
});

module.exports = Patient;
