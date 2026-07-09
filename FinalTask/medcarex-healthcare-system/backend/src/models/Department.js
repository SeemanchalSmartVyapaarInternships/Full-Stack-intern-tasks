const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Department = sequelize.define("Department", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "departments",
});

module.exports = Department;
