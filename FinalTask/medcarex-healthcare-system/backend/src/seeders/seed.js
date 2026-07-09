const mysql = require("mysql2/promise");
const env = require("../config/env");

function quoteIdentifier(identifier) {
  return `\`${String(identifier).replace(/`/g, "``")}\``;
}

async function ensureDatabase() {
  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS ${quoteIdentifier(env.db.name)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await connection.end();
}

async function seed() {
  await ensureDatabase();
  const { sequelize, User, Department, Doctor, Patient, Appointment } = require("../models");

  await sequelize.sync({ alter: true });

  const admin = await User.findOrCreate({
    where: { email: process.env.SEED_ADMIN_EMAIL || "admin@medcarex.local" },
    defaults: {
      name: process.env.SEED_ADMIN_NAME || "MedCareX Admin",
      passwordHash: process.env.SEED_ADMIN_PASSWORD || "Admin@12345",
      role: "admin",
    },
  });

  const departments = await Promise.all([
    Department.findOrCreate({ where: { code: "CARD" }, defaults: { name: "Cardiology", description: "Heart care and cardiovascular treatment." } }),
    Department.findOrCreate({ where: { code: "NEUR" }, defaults: { name: "Neurology", description: "Brain, spinal cord and nerve care." } }),
    Department.findOrCreate({ where: { code: "PED" }, defaults: { name: "Pediatrics", description: "Medical services for infants, children and adolescents." } }),
  ]);

  const [doctorUser] = await User.findOrCreate({
    where: { email: "doctor@medcarex.local" },
    defaults: { name: "Dr. Hamida Jannat", passwordHash: "Doctor@12345", role: "doctor" },
  });

  const [doctor] = await Doctor.findOrCreate({
    where: { licenseNumber: "MCX-DOC-1001" },
    defaults: {
      userId: doctorUser.id,
      departmentId: departments[0][0].id,
      specialization: "Cardiologist and Preventive Care",
      phone: "+91-90000-10001",
      experienceYears: 9,
      consultationFee: 800,
      availability: { monday: ["09:00", "13:00"], wednesday: ["14:00", "18:00"] },
    },
  });

  const [patient] = await Patient.findOrCreate({
    where: { patientCode: "MCX-DEMO-001" },
    defaults: {
      firstName: "Aarav",
      lastName: "Mehta",
      email: "aarav.mehta@example.com",
      phone: "+91-90000-20001",
      gender: "male",
      dateOfBirth: "1994-04-18",
      bloodGroup: "B+",
      address: "Mumbai, Maharashtra",
      allergies: "Penicillin",
      medicalHistory: "Mild asthma",
      createdBy: admin[0].id,
    },
  });

  await Appointment.findOrCreate({
    where: { patientId: patient.id, doctorId: doctor.id, reason: "Routine cardiac follow-up" },
    defaults: {
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      durationMinutes: 30,
      status: "booked",
      createdBy: admin[0].id,
    },
  });

  console.log("Seed complete.");
  console.log(`Admin: ${process.env.SEED_ADMIN_EMAIL || "admin@medcarex.local"} / ${process.env.SEED_ADMIN_PASSWORD || "Admin@12345"}`);
  await sequelize.close();
}

seed().catch(async (error) => {
  console.error(error);
  await sequelize.close();
  process.exit(1);
});
