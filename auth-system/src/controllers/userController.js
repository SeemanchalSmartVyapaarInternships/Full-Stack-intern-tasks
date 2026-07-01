const { User, Department, UploadHistory } = require("../models");
const { uploadToStorage } = require("../utils/uploadService");
const { logActivity } = require("../utils/activityLogger");

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
      include: [{ model: Department, as: "department", attributes: ["id", "name"] }],
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const getTeam = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: ["manager", "employee"] },
      attributes: { exclude: ["password"] },
      order: [["name", "ASC"]],
      include: [{ model: Department, as: "department", attributes: ["id", "name"] }],
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const getManagers = async (req, res) => {
  try {
    const managers = await User.findAll({
      where: { role: "manager" },
      attributes: ["id", "name", "email"],
      order: [["name", "ASC"]],
    });

    return res.status(200).json({ success: true, data: managers });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const getEmployees = async (req, res) => {
  try {
    const employees = await User.findAll({
      where: { role: "employee" },
      attributes: ["id", "name", "email"],
      order: [["name", "ASC"]],
    });

    return res.status(200).json({ success: true, data: employees });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const updateProfile = async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ success: false, message: "Name must be at least 2 characters." });
  }
  if (name.trim().length > 100) {
    return res.status(400).json({ success: false, message: "Name must be under 100 characters." });
  }

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    user.name = name.trim();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated.",
      data: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const updateUserRole = async (req, res) => {
  const { role } = req.body;
  const validRoles = ["admin", "manager", "employee"];

  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ success: false, message: "Valid role is required (admin, manager, employee)." });
  }

  try {
    const targetUser = await User.findByPk(req.params.id);
    if (!targetUser) return res.status(404).json({ success: false, message: "User not found." });

    targetUser.role = role;
    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: `Role updated to ${role}.`,
      data: { id: targetUser.id, name: targetUser.name, email: targetUser.email, role: targetUser.role },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const fileUrl = await uploadToStorage(req.file.path, "avatars");

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    user.avatarUrl = fileUrl;
    await user.save();

    await UploadHistory.create({
      fileName: req.file.originalname,
      fileUrl: fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadType: "profile_image",
      userId: req.user.id,
    });

    await logActivity(req.user.id, "UPLOAD_PROFILE_IMAGE", "user", req.user.id, { fileName: req.file.originalname, fileUrl }, req);

    return res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    console.error("Profile image upload failed:", err.message);
    return res.status(500).json({ success: false, message: "Failed to upload profile image." });
  }
};

module.exports = { getProfile, getAllUsers, getTeam, getManagers, getEmployees, updateProfile, updateUserRole, uploadProfileImage };
