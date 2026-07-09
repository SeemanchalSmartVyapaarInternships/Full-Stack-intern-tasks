const sequelize = require("../config/database");
const User = require("./User");
const Department = require("./Department");
const Doctor = require("./Doctor");
const Patient = require("./Patient");
const Appointment = require("./Appointment");
const ActivityLog = require("./ActivityLog");

User.hasOne(Doctor, { foreignKey: "userId", as: "doctorProfile" });
Doctor.belongsTo(User, { foreignKey: "userId", as: "user" });

Department.hasMany(Doctor, { foreignKey: "departmentId", as: "doctors" });
Doctor.belongsTo(Department, { foreignKey: "departmentId", as: "department" });

User.hasMany(Patient, { foreignKey: "createdBy", as: "createdPatients" });
Patient.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

Patient.hasMany(Appointment, { foreignKey: "patientId", as: "appointments" });
Appointment.belongsTo(Patient, { foreignKey: "patientId", as: "patient" });

Doctor.hasMany(Appointment, { foreignKey: "doctorId", as: "appointments" });
Appointment.belongsTo(Doctor, { foreignKey: "doctorId", as: "doctor" });

User.hasMany(Appointment, { foreignKey: "createdBy", as: "createdAppointments" });
Appointment.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

User.hasMany(ActivityLog, { foreignKey: "userId", as: "activities" });
ActivityLog.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = {
  sequelize,
  User,
  Department,
  Doctor,
  Patient,
  Appointment,
  ActivityLog,
};
