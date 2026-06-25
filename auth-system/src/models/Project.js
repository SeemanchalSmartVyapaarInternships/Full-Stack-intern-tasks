const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Project = sequelize.define("Project", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: "Project name cannot be empty" },
      len: { args: [2, 150], msg: "Name must be between 2 and 150 characters" },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("planning", "active", "on_hold", "completed", "cancelled"),
    defaultValue: "planning",
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM("low", "medium", "high", "critical"),
    defaultValue: "medium",
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isAfterStart(value) {
        if (value && this.startDate && value < this.startDate) {
          throw new Error("End date must be after start date");
        }
      },
    },
  },
});

module.exports = Project;
