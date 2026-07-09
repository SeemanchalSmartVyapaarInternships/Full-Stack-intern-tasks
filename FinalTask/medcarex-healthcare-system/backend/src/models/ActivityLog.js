const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ActivityLog = sequelize.define("ActivityLog", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: "user_id",
  },
  action: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
  entity: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: "entity_id",
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: "activity_logs",
});

module.exports = ActivityLog;
