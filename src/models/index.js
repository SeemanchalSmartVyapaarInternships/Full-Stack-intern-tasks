import { DataTypes } from 'sequelize';
import { createSequelizeInstance } from '../config/database.js';

export function initDatabase(overrides = {}) {
  const sequelize = createSequelizeInstance(overrides);

  const UploadRecord = sequelize.define(
    'UploadRecord',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      category: { type: DataTypes.ENUM('profile-image', 'project-document'), allowNull: false },
      originalName: { type: DataTypes.STRING(255), allowNull: false },
      mimeType: { type: DataTypes.STRING(120), allowNull: false },
      sizeBytes: { type: DataTypes.INTEGER, allowNull: false },
      storageProvider: { type: DataTypes.ENUM('cloudinary', 'local-fallback'), allowNull: false },
      url: { type: DataTypes.STRING(500), allowNull: false },
      publicId: { type: DataTypes.STRING(255), allowNull: true },
      uploadedBy: { type: DataTypes.STRING(120), allowNull: false, defaultValue: 'anonymous' },
      projectId: { type: DataTypes.STRING(60), allowNull: true },
    },
    { tableName: 'upload_records', timestamps: true }
  );

  const ActivityLog = sequelize.define(
    'ActivityLog',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      eventType: {
        type: DataTypes.ENUM('UPLOAD', 'LOGIN', 'TASK_UPDATE', 'SYSTEM'),
        allowNull: false,
      },
      actor: { type: DataTypes.STRING(120), allowNull: false },
      action: { type: DataTypes.STRING(200), allowNull: false },
      resource: { type: DataTypes.STRING(200), allowNull: true },
      metadataJson: { type: DataTypes.TEXT, allowNull: true },
      ipAddress: { type: DataTypes.STRING(64), allowNull: true },
    },
    { tableName: 'activity_logs', timestamps: true }
  );

  return { sequelize, UploadRecord, ActivityLog };
}
