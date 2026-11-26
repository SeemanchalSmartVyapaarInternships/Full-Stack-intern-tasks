import { DataTypes } from 'sequelize';

export function defineProjectModel(sequelize) {
  return sequelize.define(
    'Project',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(140), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      status: {
        type: DataTypes.ENUM('Planned', 'Active', 'Completed'),
        allowNull: false,
        defaultValue: 'Planned',
      },
      departmentId: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: 'projects', timestamps: true }
  );
}
