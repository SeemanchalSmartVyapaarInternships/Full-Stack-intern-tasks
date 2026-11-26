import bcrypt from 'bcryptjs';
import { buildListQuery } from '../utils/queryBuilder.js';

export function createControllers(models) {
  const { Department, User, Project, Task } = models;

  // --- Departments ---
  const listDepartments = async (req, res, next) => {
    try {
      const { page, limit, offset, order, where } = buildListQuery(req.query, {
        searchableFields: ['name', 'code'],
        allowedSortFields: ['id', 'name', 'code', 'createdAt'],
      });
      const result = await Department.findAndCountAll({ where, limit, offset, order });
      res.json({
        success: true,
        data: result.rows,
        pagination: { total: result.count, page, limit, totalPages: Math.ceil(result.count / limit) || 1 },
      });
    } catch (err) {
      next(err);
    }
  };

  const getDepartment = async (req, res, next) => {
    try {
      const dept = await Department.findByPk(req.params.id, {
        include: [
          { model: User, as: 'members' },
          { model: Project, as: 'projects' },
        ],
      });
      if (!dept) return res.status(404).json({ success: false, message: 'Department not found.' });
      return res.json({ success: true, data: dept });
    } catch (err) {
      return next(err);
    }
  };

  const createDepartment = async (req, res, next) => {
    try {
      const { name, code, description } = req.body || {};
      if (!name || !code) {
        return res.status(400).json({ success: false, message: 'Department name and code are required.' });
      }
      const created = await Department.create({
        name: String(name).trim(),
        code: String(code).trim().toUpperCase(),
        description: description || null,
      });
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      return next(err);
    }
  };

  const updateDepartment = async (req, res, next) => {
    try {
      const dept = await Department.findByPk(req.params.id);
      if (!dept) return res.status(404).json({ success: false, message: 'Department not found.' });
      await dept.update(req.body || {});
      return res.json({ success: true, data: dept });
    } catch (err) {
      return next(err);
    }
  };

  const deleteDepartment = async (req, res, next) => {
    try {
      const deleted = await Department.destroy({ where: { id: req.params.id } });
      if (!deleted) return res.status(404).json({ success: false, message: 'Department not found.' });
      return res.json({ success: true, message: 'Department deleted.' });
    } catch (err) {
      return next(err);
    }
  };

  // --- Users ---
  const listUsers = async (req, res, next) => {
    try {
      const { page, limit, offset, order, where } = buildListQuery(req.query, {
        searchableFields: ['name', 'email'],
        allowedSortFields: ['id', 'name', 'email', 'role', 'createdAt'],
      });
      if (req.query.role) where.role = req.query.role;
      if (req.query.departmentId) where.departmentId = Number(req.query.departmentId);

      const result = await User.findAndCountAll({
        where,
        limit,
        offset,
        order,
        include: [{ model: Department, as: 'department', attributes: ['id', 'name', 'code'] }],
      });
      res.json({
        success: true,
        data: result.rows,
        pagination: { total: result.count, page, limit, totalPages: Math.ceil(result.count / limit) || 1 },
      });
    } catch (err) {
      next(err);
    }
  };

  const createUser = async (req, res, next) => {
    try {
      const { name, email, password, role = 'Employee', departmentId } = req.body || {};
      if (!name || !email || !password || String(password).length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Name, valid email, and password (min 8 chars) are required.',
        });
      }
      const passwordHash = await bcrypt.hash(String(password), 10);
      const created = await User.create({
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        passwordHash,
        role,
        departmentId: departmentId || null,
      });
      const safe = await User.findByPk(created.id);
      return res.status(201).json({ success: true, data: safe });
    } catch (err) {
      return next(err);
    }
  };

  const updateUser = async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      const { name, role, departmentId } = req.body || {};
      await user.update({
        ...(name !== undefined ? { name } : {}),
        ...(role !== undefined ? { role } : {}),
        ...(departmentId !== undefined ? { departmentId } : {}),
      });
      return res.json({ success: true, data: user });
    } catch (err) {
      return next(err);
    }
  };

  const deleteUser = async (req, res, next) => {
    try {
      const deleted = await User.destroy({ where: { id: req.params.id } });
      if (!deleted) return res.status(404).json({ success: false, message: 'User not found.' });
      return res.json({ success: true, message: 'User deleted.' });
    } catch (err) {
      return next(err);
    }
  };

  // --- Projects ---
  const listProjects = async (req, res, next) => {
    try {
      const { page, limit, offset, order, where } = buildListQuery(req.query, {
        searchableFields: ['name', 'description'],
        allowedSortFields: ['id', 'name', 'status', 'createdAt'],
      });
      if (req.query.status) where.status = req.query.status;
      if (req.query.departmentId) where.departmentId = Number(req.query.departmentId);

      const result = await Project.findAndCountAll({
        where,
        limit,
        offset,
        order,
        distinct: true,
        include: [
          { model: Department, as: 'department', attributes: ['id', 'name', 'code'] },
          { model: User, as: 'teamMembers', attributes: ['id', 'name', 'email', 'role'] },
        ],
      });
      res.json({
        success: true,
        data: result.rows,
        pagination: { total: result.count, page, limit, totalPages: Math.ceil(result.count / limit) || 1 },
      });
    } catch (err) {
      next(err);
    }
  };

  const createProject = async (req, res, next) => {
    try {
      const { name, description, status = 'Planned', departmentId } = req.body || {};
      if (!name || !departmentId) {
        return res.status(400).json({ success: false, message: 'Project name and departmentId are required.' });
      }
      const created = await Project.create({ name, description, status, departmentId });
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      return next(err);
    }
  };

  const assignProjectMember = async (req, res, next) => {
    try {
      const { userId, roleInProject = 'Contributor' } = req.body || {};
      const project = await Project.findByPk(req.params.id);
      const user = await User.findByPk(userId);
      if (!project || !user) {
        return res.status(404).json({ success: false, message: 'Project or User not found.' });
      }
      await project.addTeamMember(user, { through: { roleInProject } });
      const updated = await Project.findByPk(project.id, {
        include: [{ model: User, as: 'teamMembers', attributes: ['id', 'name', 'email', 'role'] }],
      });
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      return next(err);
    }
  };

  const updateProject = async (req, res, next) => {
    try {
      const project = await Project.findByPk(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
      await project.update(req.body || {});
      return res.json({ success: true, data: project });
    } catch (err) {
      return next(err);
    }
  };

  const deleteProject = async (req, res, next) => {
    try {
      const deleted = await Project.destroy({ where: { id: req.params.id } });
      if (!deleted) return res.status(404).json({ success: false, message: 'Project not found.' });
      return res.json({ success: true, message: 'Project deleted.' });
    } catch (err) {
      return next(err);
    }
  };

  // --- Tasks ---
  const listTasks = async (req, res, next) => {
    try {
      const { page, limit, offset, order, where } = buildListQuery(req.query, {
        searchableFields: ['title', 'description'],
        allowedSortFields: ['id', 'title', 'status', 'priority', 'createdAt'],
      });
      if (req.query.status) where.status = req.query.status;
      if (req.query.priority) where.priority = req.query.priority;
      if (req.query.projectId) where.projectId = Number(req.query.projectId);

      const result = await Task.findAndCountAll({
        where,
        limit,
        offset,
        order,
        include: [
          { model: Project, as: 'project', attributes: ['id', 'name', 'status'] },
          { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        ],
      });
      res.json({
        success: true,
        data: result.rows,
        pagination: { total: result.count, page, limit, totalPages: Math.ceil(result.count / limit) || 1 },
      });
    } catch (err) {
      next(err);
    }
  };

  const createTask = async (req, res, next) => {
    try {
      const { title, description, status = 'Todo', priority = 'Medium', dueDate, projectId, assigneeId } =
        req.body || {};
      if (!title || !projectId) {
        return res.status(400).json({ success: false, message: 'Task title and projectId are required.' });
      }
      const created = await Task.create({ title, description, status, priority, dueDate, projectId, assigneeId });
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      return next(err);
    }
  };

  const updateTask = async (req, res, next) => {
    try {
      const task = await Task.findByPk(req.params.id);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
      await task.update(req.body || {});
      return res.json({ success: true, data: task });
    } catch (err) {
      return next(err);
    }
  };

  const deleteTask = async (req, res, next) => {
    try {
      const deleted = await Task.destroy({ where: { id: req.params.id } });
      if (!deleted) return res.status(404).json({ success: false, message: 'Task not found.' });
      return res.json({ success: true, message: 'Task deleted.' });
    } catch (err) {
      return next(err);
    }
  };

  return {
    listDepartments,
    getDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    listUsers,
    createUser,
    updateUser,
    deleteUser,
    listProjects,
    createProject,
    assignProjectMember,
    updateProject,
    deleteProject,
    listTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}
