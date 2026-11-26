import { DataTypes } from 'sequelize';

export function defineTaskModel(sequelize) {
  return sequelize.define(
    'Task',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING(180), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      status: {
        type: DataTypes.ENUM('Todo', 'In Progress', 'Done'),
        allowNull: false,
        defaultValue: 'Todo',
      },
      priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High'),
        allowNull: false,
        defaultValue: 'Medium',
      },
      dueDate: { type: DataTypes.STRING(30), allowNull: true },
      projectId: { type: DataTypes.INTEGER, allowNull: false },
      assigneeId: { type: DataTypes.INTEGER, allowNull: true },
    },
    { tableName: 'tasks', timestamps: true }
  );
}
