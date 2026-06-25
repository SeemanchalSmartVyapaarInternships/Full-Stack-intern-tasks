const sequelize = require("../config/database");
const User = require("./User");
const Otp = require("./Otp");
const Department = require("./Department");
const Project = require("./Project");
const Task = require("./Task");
const ProjectMember = require("./ProjectMember");

// ─── One-to-Many: Department -> Users ────────────────────────────
Department.hasMany(User, { foreignKey: "departmentId", as: "members" });
User.belongsTo(Department, { foreignKey: "departmentId", as: "department" });

// ─── One-to-Many: Department -> Projects ─────────────────────────
Department.hasMany(Project, { foreignKey: "departmentId", as: "projects" });
Project.belongsTo(Department, { foreignKey: "departmentId", as: "department" });

// ─── One-to-Many: User (owner) -> Projects ───────────────────────
User.hasMany(Project, { foreignKey: "ownerId", as: "ownedProjects" });
Project.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

// ─── One-to-Many: Project -> Tasks ───────────────────────────────
Project.hasMany(Task, { foreignKey: "projectId", as: "tasks" });
Task.belongsTo(Project, { foreignKey: "projectId", as: "project" });

// ─── One-to-Many: User (assignee) -> Tasks ──────────────────────
User.hasMany(Task, { foreignKey: "assigneeId", as: "assignedTasks" });
Task.belongsTo(User, { foreignKey: "assigneeId", as: "assignee" });

// ─── Many-to-Many: Project <-> User (through ProjectMember) ─────
Project.belongsToMany(User, { through: ProjectMember, foreignKey: "projectId", otherKey: "userId", as: "members" });
User.belongsToMany(Project, { through: ProjectMember, foreignKey: "userId", otherKey: "projectId", as: "memberProjects" });

module.exports = {
  sequelize,
  User,
  Otp,
  Department,
  Project,
  Task,
  ProjectMember,
};
