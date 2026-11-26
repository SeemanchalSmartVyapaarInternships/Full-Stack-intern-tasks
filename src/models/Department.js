import { DataTypes } from 'sequelize';

export function defineDepartmentModel(sequelize) {
  return sequelize.define(
    'Department',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
    },
    { tableName: 'departments', timestamps: true }
  );
}
