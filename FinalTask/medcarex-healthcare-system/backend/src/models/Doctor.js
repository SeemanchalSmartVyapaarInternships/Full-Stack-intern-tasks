const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Doctor = sequelize.define("Doctor", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: "user_id",
  },
  departmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: "department_id",
  },
  specialization: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  licenseNumber: {
    type: DataTypes.STRING(80),
    allowNull: false,
    unique: true,
    field: "license_number",
  },
  phone: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
  experienceYears: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: "experience_years",
  },
  consultationFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: "consultation_fee",
  },
  availability: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("active", "inactive"),
    allowNull: false,
    defaultValue: "active",
  },
}, {
  tableName: "doctors",
});

module.exports = Doctor;
