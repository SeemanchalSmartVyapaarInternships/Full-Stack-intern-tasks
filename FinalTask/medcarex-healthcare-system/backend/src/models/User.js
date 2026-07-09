const bcrypt = require("bcryptjs");
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(160),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "password_hash",
  },
  role: {
    type: DataTypes.ENUM("admin", "doctor", "receptionist", "nurse", "patient"),
    allowNull: false,
    defaultValue: "patient",
  },
  status: {
    type: DataTypes.ENUM("active", "inactive"),
    allowNull: false,
    defaultValue: "active",
  },
}, {
  tableName: "users",
  defaultScope: {
    attributes: { exclude: ["passwordHash"] },
  },
  scopes: {
    withPassword: {},
  },
});

User.beforeCreate(async (user) => {
  user.email = user.email.toLowerCase();
  user.passwordHash = await bcrypt.hash(user.passwordHash, 12);
});

User.beforeUpdate(async (user) => {
  if (user.changed("email")) user.email = user.email.toLowerCase();
  if (user.changed("passwordHash")) {
    user.passwordHash = await bcrypt.hash(user.passwordHash, 12);
  }
});

User.prototype.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = User;
