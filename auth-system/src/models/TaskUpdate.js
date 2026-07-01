const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TaskUpdate = sequelize.define("TaskUpdate", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  taskId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  previousStatus: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  newStatus: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  previousAssigneeId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  newAssigneeId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = TaskUpdate;
