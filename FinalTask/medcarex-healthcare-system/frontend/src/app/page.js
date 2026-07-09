"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarClock,
  LogOut,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
  UserPlus,
} from "lucide-react";
import { apiFetch, clearSession, getUser, setSession } from "../lib/api";

const initialPatient = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "female",
  dateOfBirth: "1995-01-01",
  bloodGroup: "",
  address: "",
  emergencyContact: "",
  allergies: "",
  medicalHistory: "",
  insuranceProvider: "",
  insuranceNumber: "",
};

const initialDoctor = {
  name: "",
  email: "",
  password: "Doctor@12345",
  departmentId: "",
  specialization: "",
  licenseNumber: "",
  phone: "",
  experienceYears: 3,
  consultationFee: 500,
};

const initialAppointment = {
  patientId: "",
  doctorId: "",
  scheduledAt: "",
  durationMinutes: 30,
  reason: "",
  notes: "",
};

function Field({ label, children }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-[#123f63]">
      {label}
      {children}
    </label>
  );
}

function Metric({ icon: Icon, label, value, tone }) {
  return (
    <div className="panel metric p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#5f7690]">{label}</p>
          <p className="mt-2 text-3xl font-black text-[#0b2f4a]">{value ?? 0}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-lg" style={{ background: tone }}>
          <Icon size={22} />
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "admin@medcarex.local", password: "Admin@12345", role: "patient" });
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboard, setDashboard] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patientForm, setPatientForm] = useState(initialPatient);
  const [doctorForm, setDoctorForm] = useState(initialDoctor);
  const [departmentForm, setDepartmentForm] = useState({ name: "", code: "", description: "" });
  const [appointmentForm, setAppointmentForm] = useState(initialAppointment);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  const canManage = useMemo(() => ["admin", "receptionist", "nurse"].includes(user?.role), [user]);
  const canAdmin = user?.role === "admin";

  useEffect(() => {
    const saved = getUser();
    if (saved) setUser(saved);
  }, []);

  useEffect(() => {
    if (user) refreshData();
  }, [user]);

  async function refreshData(q = "") {
    setStatus("");
    setDataLoading(true);
    try {
      const results = await Promise.allSettled([
        apiFetch("/dashboard"),
        apiFetch(`/patients${q ? `?q=${encodeURIComponent(q)}` : ""}`),
        apiFetch("/doctors"),
        apiFetch("/doctors/departments"),
        apiFetch("/appointments"),
      ]);

      const [dash, patientRes, doctorRes, departmentRes, appointmentRes] = results;
      const rejected = results.find((result) => result.status === "rejected");

      if (rejected?.reason?.status === 401) {
        clearSession();
        setUser(null);
        setStatus("Session expired. Please login again.");
        return;
      }

      if (dash.status === "fulfilled") setDashboard(dash.value.data);
      if (patientRes.status === "fulfilled") setPatients(patientRes.value.data.patients);
      if (doctorRes.status === "fulfilled") setDoctors(doctorRes.value.data.doctors);
      if (departmentRes.status === "fulfilled") setDepartments(departmentRes.value.data.departments);
      if (appointmentRes.status === "fulfilled") setAppointments(appointmentRes.value.data.appointments);

      const errors = results
        .filter((result) => result.status === "rejected")
        .map((result) => result.reason.message);
      if (errors.length > 0) {
        setStatus(`Some data could not load: ${[...new Set(errors)].join(" ")}`);
      }
    } catch (error) {
      setStatus(error.message);
    } finally {
      setDataLoading(false);
    }
  }

  async function submitAuth(event) {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const payload = mode === "login"
        ? { email: authForm.email, password: authForm.password }
        : authForm;
      const res = await apiFetch(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSession(res.data);
      setUser(res.data.user);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createPatient(event) {
    event.preventDefault();
    if (await mutate("/patients", patientForm, "Patient added.")) {
      setPatientForm(initialPatient);
    }
  }

  async function createDepartment(event) {
    event.preventDefault();
    if (await mutate("/doctors/departments", departmentForm, "Department created.")) {
      setDepartmentForm({ name: "", code: "", description: "" });
    }
  }

  async function createDoctor(event) {
    event.preventDefault();
    if (await mutate("/doctors", doctorForm, "Doctor profile created.")) {
      setDoctorForm(initialDoctor);
    }
  }

  async function createAppointment(event) {
    event.preventDefault();
    if (await mutate("/appointments", appointmentForm, "Appointment booked.")) {
      setAppointmentForm(initialAppointment);
    }
  }

  async function updateAppointment(id, statusValue) {
    await mutate(`/appointments/${id}`, { status: statusValue }, "Appointment updated.", "PUT");
  }

  async function mutate(path, payload, successMessage, method = "POST") {
    setLoading(true);
    setStatus("");
    try {
      await apiFetch(path, { method, body: JSON.stringify(payload) });
      setStatus(successMessage);
      await refreshData(search);
      return true;
    } catch (error) {
      if (error.status === 401) {
        clearSession();
        setUser(null);
      }
      setStatus(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <main className="app-shell grid min-h-screen place-items-center px-4 py-10">
        <section className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="panel overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80"
              alt="Medical team reviewing patient analytics"
              className="h-64 w-full object-cover"
            />
            <div className="p-6">
              <p className="mb-2 inline-flex rounded-full bg-[#40f47a] px-3 py-1 text-xs font-black text-[#0b2f4a]">MedCareX ERP</p>
              <h1 className="text-3xl font-black text-[#0b2f4a] sm:text-5xl">Healthcare operations command center</h1>
              <p className="mt-4 max-w-2xl text-base font-medium text-[#5f7690]">
                Secure RBAC, patient records, doctor departments, appointment workflows, audit logs and analytics in one deployable MVP.
              </p>
            </div>
          </div>

          <form onSubmit={submitAuth} className="panel grid content-start gap-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#5f7690]">{mode === "login" ? "Welcome back" : "Create account"}</p>
                <h2 className="text-2xl font-black text-[#0b2f4a]">{mode === "login" ? "Login" : "Register"}</h2>
              </div>
              <ShieldCheck className="text-[#40f47a]" />
            </div>
            {mode === "register" && (
              <Field label="Full name">
                <input className="field" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} />
              </Field>
            )}
            <Field label="Email">
              <input className="field" type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
            </Field>
            <Field label="Password">
              <input className="field" type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />
            </Field>
            {mode === "register" && (
              <Field label="Role">
                <select className="field" value={authForm.role} onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="nurse">Nurse</option>
                </select>
              </Field>
            )}
            <button className="btn btn-primary" disabled={loading}>{loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}</button>
            <button type="button" className="btn btn-soft" onClick={() => setMode(mode === "login" ? "register" : "login")}>
              {mode === "login" ? "Need an account?" : "Already registered?"}
            </button>
            {status && <p className="rounded-lg bg-[#fff3d2] p-3 text-sm font-bold text-[#8a6400]">{status}</p>}
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell min-h-screen">
      <header className="sticky top-0 z-10 border-b border-[#d9e8f5] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-[#5f7690]">MedCareX</p>
            <h1 className="text-xl font-black text-[#0b2f4a]">Healthcare ERP Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#eef6ff] px-3 py-2 text-sm font-bold text-[#123f63]">{user.name} / {user.role}</span>
            <button className="btn btn-soft" onClick={() => { clearSession(); setUser(null); }}>
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]">
        <nav className="grid content-start gap-2">
          {[
            ["overview", Activity, "Overview"],
            ["patients", Users, "Patients"],
            ["doctors", Stethoscope, "Doctors"],
            ["appointments", CalendarClock, "Appointments"],
          ].map(([key, Icon, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`btn justify-start ${activeTab === key ? "tab-active" : "tab-inactive"}`}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>

        <section className="grid gap-6">
          {status && <p className="panel border-l-4 border-l-[#40f47a] p-3 text-sm font-bold">{status}</p>}
          {dataLoading && <p className="panel p-3 text-sm font-bold text-[#5f7690]">Refreshing clinical workspace...</p>}

          {activeTab === "overview" && (
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-4">
                <Metric icon={Users} label="Patients" value={dashboard?.stats.totalPatients} tone="#e4f9ff" />
                <Metric icon={Stethoscope} label="Active doctors" value={dashboard?.stats.activeDoctors} tone="#e8fff0" />
                <Metric icon={CalendarClock} label="Today visits" value={dashboard?.stats.todayAppointments} tone="#fff6da" />
                <Metric icon={Activity} label="Booked" value={dashboard?.stats.bookedAppointments} tone="#ffece8" />
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="panel p-5">
                  <h2 className="text-lg font-black">Department load</h2>
                  <div className="mt-4 grid gap-3">
                    {(dashboard?.departmentLoad || []).map((department) => (
                      <div key={department.id} className="flex items-center justify-between border-b border-[#d9e8f5] pb-3">
                        <span className="font-bold">{department.name}</span>
                        <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-sm font-black">{department.doctorCount} doctors</span>
                      </div>
                    ))}
                    {(dashboard?.departmentLoad || []).length === 0 && <p className="text-sm font-semibold text-[#5f7690]">No department analytics yet.</p>}
                  </div>
                </div>
                <div className="panel p-5">
                  <h2 className="text-lg font-black">Recent activity</h2>
                  <div className="mt-4 grid gap-3">
                    {(dashboard?.recentActivities || []).map((log) => (
                      <div key={log.id} className="border-b border-[#d9e8f5] pb-3">
                        <p className="font-bold">{log.action} {log.entity}</p>
                        <p className="text-sm text-[#5f7690]">{log.user?.name || "System"} / {new Date(log.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                    {(dashboard?.recentActivities || []).length === 0 && <p className="text-sm font-semibold text-[#5f7690]">No activity logs yet.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "patients" && (
            <div className="grid gap-6">
              <div className="panel p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-black">Patient search</h2>
                  <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); refreshData(search); }}>
                    <input className="field w-64" placeholder="Search patient..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    <button className="btn btn-primary"><Search size={18} /></button>
                  </form>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-[#eef6ff] text-[#123f63]"><tr><th className="p-3">Code</th><th>Name</th><th>Phone</th><th>Gender</th><th>History</th></tr></thead>
                    <tbody>{patients.map((patient) => (
                      <tr key={patient.id} className="border-b border-[#d9e8f5]"><td className="p-3 font-bold">{patient.patientCode}</td><td>{patient.firstName} {patient.lastName}</td><td>{patient.phone}</td><td>{patient.gender}</td><td>{patient.medicalHistory || "None"}</td></tr>
                    ))}</tbody>
                  </table>
                  {patients.length === 0 && <p className="p-4 text-sm font-semibold text-[#5f7690]">No patients found.</p>}
                </div>
              </div>

              {canManage && (
                <form onSubmit={createPatient} className="panel grid gap-4 p-5">
                  <h2 className="flex items-center gap-2 text-lg font-black"><UserPlus size={20} /> Add patient</h2>
                  <div className="grid gap-4 md:grid-cols-3">
                    {["firstName", "lastName", "email", "phone", "bloodGroup", "emergencyContact", "insuranceProvider", "insuranceNumber"].map((key) => (
                      <Field key={key} label={key.replace(/([A-Z])/g, " $1")}>
                        <input className="field" value={patientForm[key]} onChange={(e) => setPatientForm({ ...patientForm, [key]: e.target.value })} />
                      </Field>
                    ))}
                    <Field label="Gender"><select className="field" value={patientForm.gender} onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></select></Field>
                    <Field label="Date of birth"><input type="date" className="field" value={patientForm.dateOfBirth} onChange={(e) => setPatientForm({ ...patientForm, dateOfBirth: e.target.value })} /></Field>
                  </div>
                  <Field label="Medical history"><textarea className="field" value={patientForm.medicalHistory} onChange={(e) => setPatientForm({ ...patientForm, medicalHistory: e.target.value })} /></Field>
                  <button className="btn btn-primary w-fit" disabled={loading}>Save patient</button>
                </form>
              )}
            </div>
          )}

          {activeTab === "doctors" && (
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-3">
                {doctors.map((doctor) => (
                  <article key={doctor.id} className="panel overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80" alt="Doctor profile" className="h-40 w-full object-cover" />
                    <div className="p-4">
                      <h3 className="text-lg font-black">{doctor.user?.name}</h3>
                      <p className="font-bold text-[#5f7690]">{doctor.specialization}</p>
                      <p className="mt-2 text-sm">{doctor.department?.name} / {doctor.experienceYears} years</p>
                    </div>
                  </article>
                ))}
                {doctors.length === 0 && <p className="panel p-4 text-sm font-semibold text-[#5f7690]">No doctors configured yet.</p>}
              </div>

              {canAdmin && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <form onSubmit={createDepartment} className="panel grid gap-4 p-5">
                    <h2 className="text-lg font-black">Create department</h2>
                    <Field label="Name"><input className="field" value={departmentForm.name} onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })} /></Field>
                    <Field label="Code"><input className="field" value={departmentForm.code} onChange={(e) => setDepartmentForm({ ...departmentForm, code: e.target.value })} /></Field>
                    <Field label="Description"><textarea className="field" value={departmentForm.description} onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })} /></Field>
                    <button className="btn btn-primary">Save department</button>
                  </form>
                  <form onSubmit={createDoctor} className="panel grid gap-4 p-5">
                    <h2 className="text-lg font-black">Create doctor profile</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      {["name", "email", "password", "specialization", "licenseNumber", "phone", "experienceYears", "consultationFee"].map((key) => (
                        <Field key={key} label={key.replace(/([A-Z])/g, " $1")}>
                          <input className="field" type={key === "password" ? "password" : "text"} value={doctorForm[key]} onChange={(e) => setDoctorForm({ ...doctorForm, [key]: e.target.value })} />
                        </Field>
                      ))}
                    </div>
                    <Field label="Department"><select className="field" value={doctorForm.departmentId} onChange={(e) => setDoctorForm({ ...doctorForm, departmentId: e.target.value })}><option value="">Select department</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></Field>
                    <button className="btn btn-primary">Save doctor</button>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === "appointments" && (
            <div className="grid gap-6">
              <div className="panel overflow-x-auto p-5">
                <h2 className="mb-4 text-lg font-black">Appointment history</h2>
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-[#eef6ff] text-[#123f63]"><tr><th className="p-3">Patient</th><th>Doctor</th><th>Schedule</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>{appointments.map((item) => (
                    <tr key={item.id} className="border-b border-[#d9e8f5]">
                      <td className="p-3 font-bold">{item.patient?.firstName} {item.patient?.lastName}</td>
                      <td>{item.doctor?.user?.name}</td>
                      <td>{new Date(item.scheduledAt).toLocaleString()}</td>
                      <td><span className="rounded-full bg-[#e8fff0] px-3 py-1 font-bold">{item.status}</span></td>
                      <td><button className="btn btn-soft" onClick={() => updateAppointment(item.id, item.status === "completed" ? "booked" : "completed")}>Toggle complete</button></td>
                    </tr>
                  ))}</tbody>
                </table>
                {appointments.length === 0 && <p className="p-4 text-sm font-semibold text-[#5f7690]">No appointments yet.</p>}
              </div>

              {["admin", "receptionist"].includes(user.role) && (
                <form onSubmit={createAppointment} className="panel grid gap-4 p-5">
                  <h2 className="text-lg font-black">Book appointment</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Patient"><select className="field" value={appointmentForm.patientId} onChange={(e) => setAppointmentForm({ ...appointmentForm, patientId: e.target.value })}><option value="">Select patient</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.firstName} {patient.lastName}</option>)}</select></Field>
                    <Field label="Doctor"><select className="field" value={appointmentForm.doctorId} onChange={(e) => setAppointmentForm({ ...appointmentForm, doctorId: e.target.value })}><option value="">Select doctor</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.user?.name} - {doctor.specialization}</option>)}</select></Field>
                    <Field label="Schedule"><input className="field" type="datetime-local" value={appointmentForm.scheduledAt} onChange={(e) => setAppointmentForm({ ...appointmentForm, scheduledAt: e.target.value })} /></Field>
                    <Field label="Reason"><input className="field" value={appointmentForm.reason} onChange={(e) => setAppointmentForm({ ...appointmentForm, reason: e.target.value })} /></Field>
                  </div>
                  <Field label="Notes"><textarea className="field" value={appointmentForm.notes} onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })} /></Field>
                  <button className="btn btn-primary w-fit">Book appointment</button>
                </form>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
