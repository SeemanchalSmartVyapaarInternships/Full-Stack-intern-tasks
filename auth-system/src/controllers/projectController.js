const { Project, Department, User, Task, ProjectMember, UploadHistory } = require("../models");
const { buildPaginatedQuery, paginatedResponse } = require("../utils/queryHelper");
const { logActivity } = require("../utils/activityLogger");
const { uploadToStorage } = require("../utils/uploadService");

// ─── CREATE ─────────────────────────────────────────────────────
const createProject = async (req, res) => {
  const { name, description, status, priority, startDate, endDate, departmentId } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ success: false, message: "Project name is required (min 2 characters)." });
  }

  try {
    // Validate department exists if provided
    if (departmentId) {
      const dept = await Department.findByPk(departmentId);
      if (!dept) return res.status(404).json({ success: false, message: "Department not found." });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description?.trim() || null,
      status: status || "planning",
      priority: priority || "medium",
      startDate: startDate || null,
      endDate: endDate || null,
      departmentId: departmentId || null,
      ownerId: req.user.id,
    });

    await logActivity(req.user.id, "CREATE_PROJECT", "project", project.id, { name: project.name }, req);

    return res.status(201).json({
      success: true,
      message: "Project created successfully.",
      data: project,
    });
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET ALL (paginated, searchable, filterable, sortable) ──────
const getAllProjects = async (req, res) => {
  try {
    const { where, order, limit, offset, page, pageSize } = buildPaginatedQuery(
      req,
      ["name", "description"],
      ["status", "priority", "departmentId", "ownerId"],
      "-createdAt"
    );

    const { count, rows } = await Project.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: [
        { model: Department, as: "department", attributes: ["id", "name"] },
        { model: User, as: "owner", attributes: ["id", "name", "email"] },
      ],
      distinct: true,
    });

    return res.status(200).json(paginatedResponse(rows, count, page, pageSize));
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET BY ID ──────────────────────────────────────────────────
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: Department, as: "department", attributes: ["id", "name"] },
        { model: User, as: "owner", attributes: ["id", "name", "email"] },
        { model: Task, as: "tasks", include: [{ model: User, as: "assignee", attributes: ["id", "name", "email"] }] },
        { model: User, as: "members", attributes: ["id", "name", "email", "role"], through: { attributes: ["role"] } },
      ],
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    return res.status(200).json({ success: true, data: project });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── UPDATE ─────────────────────────────────────────────────────
const updateProject = async (req, res) => {
  const { name, description, status, priority, startDate, endDate, departmentId } = req.body;

  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });

    if (departmentId !== undefined) {
      if (departmentId) {
        const dept = await Department.findByPk(departmentId);
        if (!dept) return res.status(404).json({ success: false, message: "Department not found." });
      }
      project.departmentId = departmentId || null;
    }

    if (name !== undefined) project.name = name.trim();
    if (description !== undefined) project.description = description?.trim() || null;
    if (status !== undefined) project.status = status;
    if (priority !== undefined) project.priority = priority;
    if (startDate !== undefined) project.startDate = startDate || null;
    if (endDate !== undefined) project.endDate = endDate || null;

    await project.save();

    await logActivity(req.user.id, "UPDATE_PROJECT", "project", project.id, { name: project.name, status: project.status }, req);

    return res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      data: project,
    });
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── DELETE ─────────────────────────────────────────────────────
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });

    const name = project.name;
    // Cascade: destroy tasks + members first
    await Task.destroy({ where: { projectId: project.id } });
    await ProjectMember.destroy({ where: { projectId: project.id } });
    await project.destroy();

    await logActivity(req.user.id, "DELETE_PROJECT", "project", req.params.id, { name }, req);

    return res.status(200).json({ success: true, message: "Project and its tasks deleted successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── ADD MEMBER ─────────────────────────────────────────────────
const addProjectMember = async (req, res) => {
  const { userId, role } = req.body;

  if (!userId) return res.status(400).json({ success: false, message: "userId is required." });

  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const existing = await ProjectMember.findOne({ where: { projectId: project.id, userId } });
    if (existing) return res.status(409).json({ success: false, message: "User is already a member of this project." });

    await ProjectMember.create({
      projectId: project.id,
      userId,
      role: role || "developer",
    });

    return res.status(201).json({ success: true, message: "Member added to project." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── REMOVE MEMBER ──────────────────────────────────────────────
const removeProjectMember = async (req, res) => {
  try {
    const deleted = await ProjectMember.destroy({
      where: { projectId: req.params.id, userId: req.params.userId },
    });

    if (!deleted) return res.status(404).json({ success: false, message: "Member not found in this project." });

    return res.status(200).json({ success: true, message: "Member removed from project." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const uploadProjectDocument = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const fileUrl = await uploadToStorage(req.file.path, `projects/${project.id}`);

    const document = await UploadHistory.create({
      fileName: req.file.originalname,
      fileUrl: fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadType: "project_document",
      userId: req.user.id,
      projectId: project.id,
    });

    await logActivity(req.user.id, "UPLOAD_PROJECT_DOCUMENT", "document", document.id, {
      fileName: req.file.originalname,
      projectId: project.id,
      projectName: project.name,
    }, req);

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully.",
      data: document,
    });
  } catch (err) {
    console.error("Document upload failed:", err.message);
    return res.status(500).json({ success: false, message: "Failed to upload document." });
  }
};

const getProjectDocuments = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });

    const documents = await UploadHistory.findAll({
      where: { projectId: project.id, uploadType: "project_document" },
      include: [{ model: User, as: "uploader", attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (err) {
    console.error("Failed to retrieve documents:", err.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve documents." });
  }
};

const deleteProjectDocument = async (req, res) => {
  try {
    const document = await UploadHistory.findByPk(req.params.docId);
    if (!document) return res.status(404).json({ success: false, message: "Document not found." });

    if (req.user.role === "employee" && document.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only delete your own documents." });
    }

    const fileName = document.fileName;
    const projectId = document.projectId;

    await document.destroy();

    await logActivity(req.user.id, "DELETE_PROJECT_DOCUMENT", "document", req.params.docId, {
      fileName,
      projectId,
    }, req);

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully.",
    });
  } catch (err) {
    console.error("Failed to delete document:", err.message);
    return res.status(500).json({ success: false, message: "Failed to delete document." });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  uploadProjectDocument,
  getProjectDocuments,
  deleteProjectDocument,
};
