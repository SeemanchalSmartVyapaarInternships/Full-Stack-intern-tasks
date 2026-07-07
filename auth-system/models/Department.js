// ============================================================
// Department Model — Sequelize
// ============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Department = sequelize.define(
  'departments',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: { msg: 'Department name must be unique' },
      validate: {
        notEmpty: { msg: 'Department name cannot be empty' },
        len: {
          args: [2, 100],
          msg: 'Department name must be between 2 and 100 characters',
        },
      },
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }
);

module.exports = Department;
