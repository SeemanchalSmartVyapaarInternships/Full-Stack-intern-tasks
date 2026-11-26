import bcrypt from 'bcryptjs';

export async function seedMedcarexData(models) {
  const { User, Department, Doctor, Patient, Appointment, ActivityLog } = models;
  const existingUsers = await User.count();
  if (existingUsers > 0) return;

  const demoPasswordHash = await bcrypt.hash('DemoPass@123', 10);

  await User.bulkCreate([
    { name: 'Dr. Ananya Verma', email: 'admin@medcarex.in', passwordHash: demoPasswordHash, role: 'Admin' },
    { name: 'Rohan Kulkarni', email: 'manager@medcarex.in', passwordHash: demoPasswordHash, role: 'Manager' },
    { name: 'Vikash Mishra', email: 'staff@medcarex.in', passwordHash: demoPasswordHash, role: 'Employee' },
  ]);

  const departments = await Department.bulkCreate([
    { name: 'Cardiology', floor: 'Floor 3 · Wing A' },
    { name: 'General Medicine', floor: 'Floor 1 · Wing B' },
    { name: 'Pediatrics', floor: 'Floor 2 · Wing A' },
    { name: 'Orthopedics', floor: 'Floor 4 · Wing C' },
  ]);

  const doctors = await Doctor.bulkCreate([
    {
      name: 'Dr. Farhan Siddiqui',
      specialization: 'Interventional Cardiology',
      licenseNo: 'MCI-48210',
      phone: '+91-9876501122',
      departmentId: departments[0].id,
    },
    {
      name: 'Dr. Kavita Sharma',
      specialization: 'Internal Medicine',
      licenseNo: 'MCI-39104',
      phone: '+91-9876502233',
      departmentId: departments[1].id,
    },
    {
      name: 'Dr. Arvind Jha',
      specialization: 'Pediatric Care',
      licenseNo: 'MCI-51209',
      phone: '+91-9876503344',
      departmentId: departments[2].id,
    },
    {
      name: 'Dr. Meenakshi Rao',
      specialization: 'Orthopedic Surgery',
      licenseNo: 'MCI-60871',
      phone: '+91-9876504455',
      departmentId: departments[3].id,
    },
  ]);

  const patients = await Patient.bulkCreate([
    {
      fullName: 'Ramesh Prasad Yadav',
      age: 54,
      gender: 'Male',
      phone: '+91-9934123456',
      bloodGroup: 'B+',
      notes: 'Hypertension follow-up; ECG scheduled',
      primaryDoctorId: doctors[0].id,
    },
    {
      fullName: 'Sunita Devi',
      age: 38,
      gender: 'Female',
      phone: '+91-9934129876',
      bloodGroup: 'O+',
      notes: 'Seasonal viral fever recovery',
      primaryDoctorId: doctors[1].id,
    },
    {
      fullName: 'Aarav Kumar',
      age: 8,
      gender: 'Male',
      phone: '+91-9811223344',
      bloodGroup: 'A+',
      notes: 'Routine pediatric immunization',
      primaryDoctorId: doctors[2].id,
    },
    {
      fullName: 'Nandini Verma',
      age: 62,
      gender: 'Female',
      phone: '+91-9811998877',
      bloodGroup: 'AB+',
      notes: 'Post-knee arthroscopy physiotherapy',
      primaryDoctorId: doctors[3].id,
    },
  ]);

  await Appointment.bulkCreate([
    {
      patientId: patients[0].id,
      doctorId: doctors[0].id,
      scheduledAt: '2026-11-27 10:30',
      reason: 'Cardiology ECG review',
      status: 'Scheduled',
    },
    {
      patientId: patients[1].id,
      doctorId: doctors[1].id,
      scheduledAt: '2026-11-26 15:00',
      reason: 'CBC lab report follow-up',
      status: 'Completed',
    },
    {
      patientId: patients[2].id,
      doctorId: doctors[2].id,
      scheduledAt: '2026-11-27 11:15',
      reason: 'Pediatric booster dose',
      status: 'Scheduled',
    },
  ]);

  await ActivityLog.bulkCreate([
    {
      actor: 'Dr. Ananya Verma',
      role: 'Admin',
      action: 'Initialized MedCareX clinical workspace',
      resource: '4 Departments · 4 Doctors',
    },
    {
      actor: 'Rohan Kulkarni',
      role: 'Manager',
      action: 'Completed appointment #2',
      resource: 'Sunita Devi · Dr. Kavita Sharma',
    },
  ]);
}
