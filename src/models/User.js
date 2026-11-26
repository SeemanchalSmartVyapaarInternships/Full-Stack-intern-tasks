import { DataTypes } from 'sequelize';

export function defineUserModel(sequelize) {
  return sequelize.define(
    'User',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(120), allowNull: false },
      email: {
        type: DataTypes.STRING(160),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      passwordHash: { type: DataTypes.STRING(255), allowNull: false },
      role: {
        type: DataTypes.ENUM('Admin', 'Manager', 'Employee'),
        allowNull: false,
        defaultValue: 'Employee',
      },
      departmentId: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: 'users',
      timestamps: true,
      defaultScope: { attributes: { exclude: ['passwordHash'] } },
      scopes: { withPassword: { attributes: { include: ['passwordHash'] } } },
    }
  );
}
