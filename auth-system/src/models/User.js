const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: "Name cannot be empty" },
      len: { args: [2, 100], msg: "Name must be between 2 and 100 characters" },
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: { msg: "Email is already registered" },
    validate: {
      isEmail: { msg: "Please provide a valid email address" },
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("admin", "manager", "employee"),
    defaultValue: "employee",
    allowNull: false,
  },
});

module.exports = User;
