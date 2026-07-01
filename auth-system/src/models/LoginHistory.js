const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LoginHistory = sequelize.define("LoginHistory", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("success", "failed"),
    allowNull: false,
  },
  failureReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = LoginHistory;
