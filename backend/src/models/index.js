import { DataTypes } from 'sequelize';
import { createSequelizeInstance } from '../config/database.js';

export function initMedcarexModels(overrides = {}) {
  const sequelize = createSequelizeInstance(overrides);

  const User = sequelize.define(
    'User',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(120), allowNull: false },
      email: { type: DataTypes.STRING(160), allowNull: false, unique: true, validate: { isEmail: true } },
      passwordHash: { type: DataTypes.STRING(255), allowNull: false },
      role: { type: DataTypes.ENUM('Admin', 'Manager', 'Employee'), allowNull: false, defaultValue: 'Employee' },
    },
    {
      tableName: 'users',
      defaultScope: { attributes: { exclude: ['passwordHash'] } },
      scopes: { withPassword: { attributes: { include: ['passwordHash'] } } },
    }
  );

  const Department = sequelize.define(
    'Department',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      floor: { type: DataTypes.STRING(40), allowNull: true },
    },
    { tableName: 'departments' }
  );

  const Doctor = sequelize.define(
    'Doctor',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(120), allowNull: false },
      specialization: { type: DataTypes.STRING(120), allowNull: false },
      licenseNo: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      phone: { type: DataTypes.STRING(30), allowNull: true },
      availability: { type: DataTypes.STRING(80), allowNull: false, defaultValue: 'Mon-Sat · 09:00-17:00' },
      departmentId: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: 'doctors' }
  );

  const Patient = sequelize.define(
    'Patient',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      fullName: { type: DataTypes.STRING(140), allowNull: false },
      age: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0, max: 130 } },
      gender: { type: DataTypes.ENUM('Male', 'Female', 'Other'), allowNull: false },
      phone: { type: DataTypes.STRING(30), allowNull: false },
      bloodGroup: { type: DataTypes.STRING(10), allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
      primaryDoctorId: { type: DataTypes.INTEGER, allowNull: true },
    },
    { tableName: 'patients' }
  );

  const Appointment = sequelize.define(
    'Appointment',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      patientId: { type: DataTypes.INTEGER, allowNull: false },
      doctorId: { type: DataTypes.INTEGER, allowNull: false },
      scheduledAt: { type: DataTypes.STRING(40), allowNull: false },
      reason: { type: DataTypes.STRING(220), allowNull: false },
      status: {
        type: DataTypes.ENUM('Scheduled', 'Completed', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Scheduled',
      },
    },
    { tableName: 'appointments' }
  );

  const ActivityLog = sequelize.define(
    'ActivityLog',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      actor: { type: DataTypes.STRING(120), allowNull: false },
      role: { type: DataTypes.STRING(40), allowNull: false },
      action: { type: DataTypes.STRING(200), allowNull: false },
      resource: { type: DataTypes.STRING(200), allowNull: true },
    },
    { tableName: 'activity_logs' }
  );

  Department.hasMany(Doctor, { foreignKey: 'departmentId', as: 'doctors' });
  Doctor.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

  Doctor.hasMany(Patient, { foreignKey: 'primaryDoctorId', as: 'patients' });
  Patient.belongsTo(Doctor, { foreignKey: 'primaryDoctorId', as: 'primaryDoctor' });

  Patient.hasMany(Appointment, { foreignKey: 'patientId', as: 'appointments', onDelete: 'CASCADE' });
  Appointment.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

  Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: 'appointments', onDelete: 'CASCADE' });
  Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

  return { sequelize, User, Department, Doctor, Patient, Appointment, ActivityLog };
}
