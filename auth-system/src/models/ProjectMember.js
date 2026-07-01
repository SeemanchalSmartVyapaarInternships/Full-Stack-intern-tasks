const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProjectMember = sequelize.define("ProjectMember", {
  role: {
    type: DataTypes.ENUM("lead", "developer", "reviewer", "viewer"),
    defaultValue: "developer",
    allowNull: false,
  },
});

module.exports = ProjectMember;
