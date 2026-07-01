const sequelize = require("../config/database");
const User = require("./User");
const Otp = require("./Otp");
const Department = require("./Department");
const Project = require("./Project");
const Task = require("./Task");
const ProjectMember = require("./ProjectMember");
const UploadHistory = require("./UploadHistory");
const LoginHistory = require("./LoginHistory");
const TaskUpdate = require("./TaskUpdate");
const ActivityLog = require("./ActivityLog");

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

// ─── One-to-Many: UploadHistory -> User / Project ───────────────
User.hasMany(UploadHistory, { foreignKey: "userId", as: "uploads" });
UploadHistory.belongsTo(User, { foreignKey: "userId", as: "uploader" });

Project.hasMany(UploadHistory, { foreignKey: "projectId", as: "documents" });
UploadHistory.belongsTo(Project, { foreignKey: "projectId", as: "project" });

// ─── One-to-Many: LoginHistory -> User ──────────────────────────
User.hasMany(LoginHistory, { foreignKey: "userId", as: "logins" });
LoginHistory.belongsTo(User, { foreignKey: "userId", as: "user" });

// ─── One-to-Many: TaskUpdate -> Task / User ─────────────────────
Task.hasMany(TaskUpdate, { foreignKey: "taskId", as: "updates" });
TaskUpdate.belongsTo(Task, { foreignKey: "taskId", as: "task" });

User.hasMany(TaskUpdate, { foreignKey: "userId", as: "taskUpdates" });
TaskUpdate.belongsTo(User, { foreignKey: "userId", as: "user" });

// ─── One-to-Many: ActivityLog -> User ───────────────────────────
User.hasMany(ActivityLog, { foreignKey: "userId", as: "activities" });
ActivityLog.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = {
  sequelize,
  User,
  Otp,
  Department,
  Project,
  Task,
  ProjectMember,
  UploadHistory,
  LoginHistory,
  TaskUpdate,
  ActivityLog,
};
