// ============================================================
// Task Model — Sequelize
// ============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Task = sequelize.define(
  'tasks',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Task title cannot be empty' },
        len: {
          args: [2, 150],
          msg: 'Task title must be between 2 and 150 characters',
        },
      },
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM('todo', 'in_progress', 'completed', 'blocked'),
      defaultValue: 'todo',
      allowNull: false,
      validate: {
        isIn: {
          args: [['todo', 'in_progress', 'completed', 'blocked']],
          msg: 'Status must be todo, in_progress, completed, or blocked',
        },
      },
    },

    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium',
      allowNull: false,
      validate: {
        isIn: {
          args: [['low', 'medium', 'high', 'critical']],
          msg: 'Priority must be low, medium, high, or critical',
        },
      },
    },

    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: { msg: 'Must be a valid date' },
      },
    },

    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },

    assignee_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  }
);

module.exports = Task;
