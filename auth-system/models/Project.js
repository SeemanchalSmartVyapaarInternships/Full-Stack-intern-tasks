// ============================================================
// Project Model — Sequelize
// ============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Project = sequelize.define(
  'projects',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Project name cannot be empty' },
        len: {
          args: [2, 100],
          msg: 'Project name must be between 2 and 100 characters',
        },
      },
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM('planned', 'in_progress', 'completed', 'on_hold'),
      defaultValue: 'planned',
      allowNull: false,
      validate: {
        isIn: {
          args: [['planned', 'in_progress', 'completed', 'on_hold']],
          msg: 'Status must be planned, in_progress, completed, or on_hold',
        },
      },
    },

    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'departments',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  }
);

module.exports = Project;
