// ============================================================
// Model Loader & Associations — Sequelize
// ============================================================

const User = require('./User');
const Otp = require('./Otp');
const Department = require('./Department');
const Project = require('./Project');
const Task = require('./Task');
const ProjectMember = require('./ProjectMember');

// ---- Define Associations ----

// 1. Department <-> User (One-to-Many)
Department.hasMany(User, { foreignKey: 'department_id', as: 'users' });
User.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

// 2. Department <-> Project (One-to-Many)
Department.hasMany(Project, { foreignKey: 'department_id', as: 'projects' });
Project.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

// 3. Project <-> Task (One-to-Many)
Project.hasMany(Task, { foreignKey: 'project_id', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// 4. User <-> Task (One-to-Many)
User.hasMany(Task, { foreignKey: 'assignee_id', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'assignee_id', as: 'assignee' });

// 5. User <-> Project (Many-to-Many)
Project.belongsToMany(User, {
  through: ProjectMember,
  foreignKey: 'project_id',
  otherKey: 'user_id',
  as: 'members',
});
User.belongsToMany(Project, {
  through: ProjectMember,
  foreignKey: 'user_id',
  otherKey: 'project_id',
  as: 'projects',
});

module.exports = {
  User,
  Otp,
  Department,
  Project,
  Task,
  ProjectMember,
};
