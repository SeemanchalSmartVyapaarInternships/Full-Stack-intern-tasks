const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Task = sequelize.define("Task", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: "Task title cannot be empty" },
      len: { args: [2, 200], msg: "Title must be between 2 and 200 characters" },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("todo", "in_progress", "in_review", "done", "cancelled"),
    defaultValue: "todo",
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM("low", "medium", "high", "critical"),
    defaultValue: "medium",
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Task;
