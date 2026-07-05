// ============================================================
// User Model — Sequelize
// ============================================================

const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/db');

const SALT_ROUNDS = 12;

const User = sequelize.define(
  'users',
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
        notEmpty: { msg: 'Name cannot be empty' },
        len: {
          args: [2, 100],
          msg: 'Name must be between 2 and 100 characters',
        },
      },
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: { msg: 'Email address is already registered' },
      validate: {
        isEmail: { msg: 'Please provide a valid email address' },
        notEmpty: { msg: 'Email cannot be empty' },
      },
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password cannot be empty' },
      },
    },

    role: {
      type: DataTypes.ENUM('admin', 'manager', 'employee'),
      defaultValue: 'employee',
      allowNull: false,
      validate: {
        isIn: {
          args: [['admin', 'manager', 'employee']],
          msg: 'Role must be admin, manager, or employee',
        },
      },
    },
  },
  {
    // ---- Hooks ----
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
        }
      },
    },

    // Exclude password from default JSON serialisation
    defaultScope: {
      attributes: { exclude: ['password'] },
    },

    // Scope that includes password — used only during login
    scopes: {
      withPassword: {
        attributes: { include: ['password'] },
      },
    },
  }
);

// ---- Instance Methods ----

/**
 * Compare a plain-text password with the hashed password.
 * @param {string} plainPassword
 * @returns {Promise<boolean>}
 */
User.prototype.validatePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = User;
