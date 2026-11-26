import { DataTypes } from 'sequelize';
import { createSequelizeInstance } from '../config/database.js';
import { defineDepartmentModel } from './Department.js';
import { defineUserModel } from './User.js';
import { defineProjectModel } from './Project.js';
import { defineTaskModel } from './Task.js';

export function initDatabase(overrides = {}) {
  const sequelize = createSequelizeInstance(overrides);

  const Department = defineDepartmentModel(sequelize);
  const User = defineUserModel(sequelize);
  const Project = defineProjectModel(sequelize);
  const Task = defineTaskModel(sequelize);
  const ProjectMember = sequelize.define(
    'ProjectMember',
    {
      roleInProject: { type: DataTypes.STRING(60), allowNull: false, defaultValue: 'Contributor' },
    },
    { tableName: 'project_members', timestamps: true }
  );

  // One-to-Many relationships
  Department.hasMany(User, { foreignKey: 'departmentId', as: 'members' });
  User.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

  Department.hasMany(Project, { foreignKey: 'departmentId', as: 'projects', onDelete: 'CASCADE' });
  Project.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

  Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks', onDelete: 'CASCADE' });
  Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

  User.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });
  Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

  // Many-to-Many relationship
  User.belongsToMany(Project, { through: ProjectMember, foreignKey: 'userId', as: 'projects' });
  Project.belongsToMany(User, { through: ProjectMember, foreignKey: 'projectId', as: 'teamMembers' });

  return { sequelize, Department, User, Project, Task, ProjectMember };
}
