import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../middleware/auth.js';

export function createMedcarexController(models) {
  const { User, Department, Doctor, Patient, Appointment, ActivityLog } = models;

  const logEvent = (req, action, resource) =>
    ActivityLog.create({
      actor: req.user?.name || req.body?.email || 'System',
      role: req.user?.role || 'Guest',
      action,
      resource,
    });

  const signToken = (user) =>
    jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

  const register = async (req, res, next) => {
    try {
      const { name, email, password, role = 'Employee' } = req.body || {};
      if (!name || !email || !password || String(password).length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password (min 8 chars) are required.',
        });
      }
      const normalizedEmail = String(email).trim().toLowerCase();
      if (await User.findOne({ where: { email: normalizedEmail } })) {
        return res.status(409).json({ success: false, message: 'Email already registered.' });
      }
      const passwordHash = await bcrypt.hash(String(password), 10);
      const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash, role });
      const safeUser = await User.findByPk(user.id);
      await ActivityLog.create({
        actor: safeUser.name,
        role: safeUser.role,
        action: 'Registered new MedCareX account',
        resource: safeUser.email,
      });
      return res.status(201).json({
        success: true,
        data: { user: safeUser, accessToken: signToken(safeUser) },
      });
    } catch (err) {
      return next(err);
    }
  };

  const login = async (req, res, next) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
      }
      const userWithHash = await User.scope('withPassword').findOne({
        where: { email: String(email).trim().toLowerCase() },
      });
      if (!userWithHash || !(await bcrypt.compare(String(password), userWithHash.passwordHash))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }
      const safeUser = await User.findByPk(userWithHash.id);
      await ActivityLog.create({
        actor: safeUser.name,
        role: safeUser.role,
        action: 'Signed in to MedCareX',
        resource: safeUser.email,
      });
      return res.json({
        success: true,
        data: { user: safeUser, accessToken: signToken(safeUser) },
      });
    } catch (err) {
      return next(err);
    }
  };

  const getMe = (req, res) => res.json({ success: true, data: { user: req.user } });

  // Patients
  const listPatients = async (req, res, next) => {
    try {
      const where = {};
      if (req.query.search) {
        const term = `%${String(req.query.search).trim()}%`;
        where[Op.or] = [{ fullName: { [Op.like]: term } }, { phone: { [Op.like]: term } }];
      }
      const patients = await Patient.findAll({
        where,
        order: [['id', 'DESC']],
        include: [{ model: Doctor, as: 'primaryDoctor', attributes: ['id', 'name', 'specialization'] }],
      });
      res.json({ success: true, data: patients });
    } catch (err) {
      next(err);
    }
  };

  const createPatient = async (req, res, next) => {
    try {
      const { fullName, age, gender, phone, bloodGroup, notes, primaryDoctorId } = req.body || {};
      if (!fullName || age === undefined || !gender || !phone) {
        return res.status(400).json({
          success: false,
          message: 'fullName, age, gender, and phone are required.',
        });
      }
      const created = await Patient.create({
        fullName: fullName.trim(),
        age: Number(age),
        gender,
        phone: phone.trim(),
        bloodGroup: bloodGroup || null,
        notes: notes || null,
        primaryDoctorId: primaryDoctorId ? Number(primaryDoctorId) : null,
      });
      await logEvent(req, 'Registered patient', `${created.fullName} (#${created.id})`);
      const full = await Patient.findByPk(created.id, {
        include: [{ model: Doctor, as: 'primaryDoctor', attributes: ['id', 'name', 'specialization'] }],
      });
      return res.status(201).json({ success: true, data: full });
    } catch (err) {
      return next(err);
    }
  };

  const updatePatient = async (req, res, next) => {
    try {
      const patient = await Patient.findByPk(req.params.id);
      if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });
      await patient.update(req.body || {});
      await logEvent(req, 'Updated patient record', `${patient.fullName} (#${patient.id})`);
      const full = await Patient.findByPk(patient.id, {
        include: [{ model: Doctor, as: 'primaryDoctor', attributes: ['id', 'name', 'specialization'] }],
      });
      return res.json({ success: true, data: full });
    } catch (err) {
      return next(err);
    }
  };

  const deletePatient = async (req, res, next) => {
    try {
      const patient = await Patient.findByPk(req.params.id);
      if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });
      const name = patient.fullName;
      await patient.destroy();
      await logEvent(req, 'Removed patient record', name);
      return res.json({ success: true, message: 'Patient removed.' });
    } catch (err) {
      return next(err);
    }
  };

  // Doctors & Departments
  const listDepartments = async (_req, res, next) => {
    try {
      const departments = await Department.findAll({
        order: [['name', 'ASC']],
        include: [{ model: Doctor, as: 'doctors', attributes: ['id', 'name', 'specialization'] }],
      });
      res.json({ success: true, data: departments });
    } catch (err) {
      next(err);
    }
  };

  const listDoctors = async (_req, res, next) => {
    try {
      const doctors = await Doctor.findAll({
        order: [['id', 'DESC']],
        include: [{ model: Department, as: 'department', attributes: ['id', 'name', 'floor'] }],
      });
      res.json({ success: true, data: doctors });
    } catch (err) {
      next(err);
    }
  };

  const createDoctor = async (req, res, next) => {
    try {
      const { name, specialization, licenseNo, phone, availability, departmentId } = req.body || {};
      if (!name || !specialization || !licenseNo || !departmentId) {
        return res.status(400).json({
          success: false,
          message: 'name, specialization, licenseNo, and departmentId are required.',
        });
      }
      const created = await Doctor.create({
        name: name.trim(),
        specialization: specialization.trim(),
        licenseNo: licenseNo.trim().toUpperCase(),
        phone: phone || null,
        availability: availability || 'Mon-Sat · 09:00-17:00',
        departmentId: Number(departmentId),
      });
      await logEvent(req, 'Added doctor profile', `${created.name} (${created.specialization})`);
      const full = await Doctor.findByPk(created.id, {
        include: [{ model: Department, as: 'department', attributes: ['id', 'name', 'floor'] }],
      });
      return res.status(201).json({ success: true, data: full });
    } catch (err) {
      return next(err);
    }
  };

  // Appointments
  const listAppointments = async (req, res, next) => {
    try {
      const where = {};
      if (req.query.status) where.status = req.query.status;
      const appointments = await Appointment.findAll({
        where,
        order: [['id', 'DESC']],
        include: [
          { model: Patient, as: 'patient', attributes: ['id', 'fullName', 'phone'] },
          { model: Doctor, as: 'doctor', attributes: ['id', 'name', 'specialization'] },
        ],
      });
      res.json({ success: true, data: appointments });
    } catch (err) {
      next(err);
    }
  };

  const createAppointment = async (req, res, next) => {
    try {
      const { patientId, doctorId, scheduledAt, reason } = req.body || {};
      if (!patientId || !doctorId || !scheduledAt || !reason) {
        return res.status(400).json({
          success: false,
          message: 'patientId, doctorId, scheduledAt, and reason are required.',
        });
      }
      const created = await Appointment.create({
        patientId: Number(patientId),
        doctorId: Number(doctorId),
        scheduledAt,
        reason: reason.trim(),
        status: 'Scheduled',
      });
      await logEvent(req, 'Booked appointment', `Appointment #${created.id} (${scheduledAt})`);
      const full = await Appointment.findByPk(created.id, {
        include: [
          { model: Patient, as: 'patient', attributes: ['id', 'fullName', 'phone'] },
          { model: Doctor, as: 'doctor', attributes: ['id', 'name', 'specialization'] },
        ],
      });
      return res.status(201).json({ success: true, data: full });
    } catch (err) {
      return next(err);
    }
  };

  const updateAppointment = async (req, res, next) => {
    try {
      const appt = await Appointment.findByPk(req.params.id);
      if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });
      await appt.update(req.body || {});
      await logEvent(req, `Updated appointment to ${appt.status}`, `Appointment #${appt.id}`);
      const full = await Appointment.findByPk(appt.id, {
        include: [
          { model: Patient, as: 'patient', attributes: ['id', 'fullName', 'phone'] },
          { model: Doctor, as: 'doctor', attributes: ['id', 'name', 'specialization'] },
        ],
      });
      return res.json({ success: true, data: full });
    } catch (err) {
      return next(err);
    }
  };

  // Dashboard & Activity Logs
  const getDashboardSummary = async (_req, res, next) => {
    try {
      const [totalPatients, totalDoctors, scheduledAppointments, completedAppointments, recentActivity, departments] =
        await Promise.all([
          Patient.count(),
          Doctor.count(),
          Appointment.count({ where: { status: 'Scheduled' } }),
          Appointment.count({ where: { status: 'Completed' } }),
          ActivityLog.findAll({ order: [['id', 'DESC']], limit: 8 }),
          Department.findAll({ include: [{ model: Doctor, as: 'doctors', attributes: ['id'] }] }),
        ]);

      res.json({
        success: true,
        data: {
          kpis: {
            totalPatients,
            totalDoctors,
            scheduledAppointments,
            completedAppointments,
          },
          departments: departments.map((d) => ({
            id: d.id,
            name: d.name,
            floor: d.floor,
            doctorCount: d.doctors?.length || 0,
          })),
          recentActivity,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  const listActivity = async (_req, res, next) => {
    try {
      const logs = await ActivityLog.findAll({ order: [['id', 'DESC']], limit: 50 });
      res.json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  };

  return {
    register,
    login,
    getMe,
    listPatients,
    createPatient,
    updatePatient,
    deletePatient,
    listDepartments,
    listDoctors,
    createDoctor,
    listAppointments,
    createAppointment,
    updateAppointment,
    getDashboardSummary,
    listActivity,
  };
}
