// ============================================================
// OTP Model — Sequelize
// ============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Otp = sequelize.define(
  'otps',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },

    otp: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },

    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }
);

module.exports = Otp;
