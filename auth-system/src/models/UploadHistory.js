const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UploadHistory = sequelize.define("UploadHistory", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  uploadType: {
    type: DataTypes.ENUM("profile_image", "project_document"),
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
});

module.exports = UploadHistory;
