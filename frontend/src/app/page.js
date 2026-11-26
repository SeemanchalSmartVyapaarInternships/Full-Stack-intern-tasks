'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  CalendarClock,
  HeartPulse,
  LogOut,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'patients', label: 'Patients' },
  { id: 'doctors', label: 'Doctors' },
  { id: 'departments', label: 'Departments' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'activity', label: 'Activity Logs' },
];

export default function MedCareXApp() {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', role: 'Employee' });
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState(null);
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  // Forms
  const [patientForm, setPatientForm] = useState({
    fullName: '',
    age: '',
    gender: 'Male',
    phone: '',
    bloodGroup: 'O+',
    notes: '',
    primaryDoctorId: '',
  });
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    specialization: '',
    licenseNo: '',
    phone: '',
    departmentId: '',
  });
  const [editingDepartmentId, setEditingDepartmentId] = useState(null);
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    floor: '',
  });
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('All');
  const [apptForm, setApptForm] = useState({
    patientId: '',
    doctorId: '',
    scheduledAt: '2026-11-28 10:00',
    reason: '',
  });

  const loadWorkspace = useCallback(async (authToken, search = '') => {
    const [sumData, patData, docData, deptData, apptData, logData] = await Promise.all([
      apiFetch('/dashboard/summary', { token: authToken }),
      apiFetch(`/patients${search ? `?search=${encodeURIComponent(search)}` : ''}`, { token: authToken }),
      apiFetch('/doctors', { token: authToken }),
      apiFetch('/departments', { token: authToken }),
      apiFetch('/appointments', { token: authToken }),
      apiFetch('/activity', { token: authToken }),
    ]);
    setSummary(sumData);
    setPatients(patData);
    setDoctors(docData);
    setDepartments(deptData);
    setAppointments(apptData);
    setLogs(logData);
  }, []);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    Promise.all([
      apiFetch('/dashboard/summary', { token }),
      apiFetch(`/patients${patientSearch ? `?search=${encodeURIComponent(patientSearch)}` : ''}`, { token }),
      apiFetch('/doctors', { token }),
      apiFetch('/departments', { token }),
      apiFetch('/appointments', { token }),
      apiFetch('/activity', { token }),
    ])
      .then(([sumData, patData, docData, deptData, apptData, logData]) => {
        if (cancelled) return;
        setSummary(sumData);
        setPatients(patData);
        setDoctors(docData);
        setDepartments(deptData);
        setAppointments(apptData);
        setLogs(logData);
      })
      .catch((err) => {
        if (!cancelled) setStatusMessage(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [token, patientSearch]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const data = await apiFetch(endpoint, { method: 'POST', body: authForm });
      setToken(data.accessToken);
      setUser(data.user);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const quickDemoLogin = async (email) => {
    setAuthError('');
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: { email, password: 'DemoPass@123' },
      });
      setToken(data.accessToken);
      setUser(data.user);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleSavePatient = async (e) => {
    e.preventDefault();
    try {
      if (editingPatientId) {
        await apiFetch(`/patients/${editingPatientId}`, { method: 'PUT', body: patientForm, token });
        setStatusMessage('Patient record updated.');
      } else {
        await apiFetch('/patients', { method: 'POST', body: patientForm, token });
        setStatusMessage('New patient registered.');
      }
      setEditingPatientId(null);
      setPatientForm({ fullName: '', age: '', gender: 'Male', phone: '', bloodGroup: 'O+', notes: '', primaryDoctorId: '' });
      await loadWorkspace(token, patientSearch);
    } catch (err) {
      setStatusMessage(err.message);
    }
  };

  const handleDeletePatient = async (id) => {
    try {
      await apiFetch(`/patients/${id}`, { method: 'DELETE', token });
      setStatusMessage('Patient removed.');
      await loadWorkspace(token, patientSearch);
    } catch (err) {
      setStatusMessage(err.message);
    }
  };

  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    try {
      if (editingDoctorId) {
        await apiFetch(`/doctors/${editingDoctorId}`, { method: 'PUT', body: doctorForm, token });
        setStatusMessage('Doctor profile updated.');
      } else {
        await apiFetch('/doctors', { method: 'POST', body: doctorForm, token });
        setStatusMessage('Doctor profile created.');
      }
      setEditingDoctorId(null);
      setDoctorForm({ name: '', specialization: '', licenseNo: '', phone: '', departmentId: '' });
      await loadWorkspace(token, patientSearch);
    } catch (err) {
      setStatusMessage(err.message);
    }
  };

  const handleDeleteDoctor = async (id) => {
    try {
      await apiFetch(`/doctors/${id}`, { method: 'DELETE', token });
      setStatusMessage('Doctor profile removed.');
      await loadWorkspace(token, patientSearch);
    } catch (err) {
      setStatusMessage(err.message);
    }
  };

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    try {
      if (editingDepartmentId) {
        await apiFetch(`/departments/${editingDepartmentId}`, { method: 'PUT', body: departmentForm, token });
        setStatusMessage('Department updated.');
      } else {
        await apiFetch('/departments', { method: 'POST', body: departmentForm, token });
        setStatusMessage('Department created.');
      }
      setEditingDepartmentId(null);
      setDepartmentForm({ name: '', floor: '' });
      await loadWorkspace(token, patientSearch);
    } catch (err) {
      setStatusMessage(err.message);
    }
  };

  const handleDeleteDepartment = async (id) => {
    try {
      await apiFetch(`/departments/${id}`, { method: 'DELETE', token });
      setStatusMessage('Department removed.');
      await loadWorkspace(token, patientSearch);
    } catch (err) {
      setStatusMessage(err.message);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/appointments', { method: 'POST', body: apptForm, token });
      setApptForm({ patientId: '', doctorId: '', scheduledAt: '2026-11-28 10:00', reason: '' });
      setStatusMessage('Appointment booked.');
      await loadWorkspace(token, patientSearch);
    } catch (err) {
      setStatusMessage(err.message);
    }
  };

  const handleAppointmentStatus = async (id, status) => {
    try {
      await apiFetch(`/appointments/${id}`, { method: 'PATCH', body: { status }, token });
      setStatusMessage(`Appointment #${id} marked ${status}.`);
      await loadWorkspace(token, patientSearch);
    } catch (err) {
      setStatusMessage(err.message);
    }
  };

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">MedCareX ERP</h1>
              <p className="text-xs text-slate-500">Healthcare Management MVP · Sign in to continue</p>
            </div>
          </div>

          <div className="mt-5 flex rounded-lg bg-slate-100 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 rounded-md py-1.5 ${authMode === 'login' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 rounded-md py-1.5 ${authMode === 'register' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}
            >
              Register
            </button>
          </div>

          {authError && (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{authError}</p>
          )}

          <form onSubmit={handleAuthSubmit} className="mt-4 space-y-3">
            {authMode === 'register' && (
              <>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={authForm.name}
                  onChange={(e) => setAuthForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <select
                  value={authForm.role}
                  onChange={(e) => setAuthForm((p) => ({ ...p, role: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </>
            )}
            <input
              type="email"
              required
              placeholder="Email address"
              value={authForm.email}
              onChange={(e) => setAuthForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="password"
              required
              placeholder="Password (min 8 chars)"
              value={authForm.password}
              onChange={(e) => setAuthForm((p) => ({ ...p, password: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              1-Click Seeded Demo Accounts
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => quickDemoLogin('admin@medcarex.in')}
                className="rounded-lg border border-slate-200 py-1.5 font-medium hover:bg-slate-50"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => quickDemoLogin('manager@medcarex.in')}
                className="rounded-lg border border-slate-200 py-1.5 font-medium hover:bg-slate-50"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => quickDemoLogin('staff@medcarex.in')}
                className="rounded-lg border border-slate-200 py-1.5 font-medium hover:bg-slate-50"
              >
                Employee
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const isAdminOrManager = user.role === 'Admin' || user.role === 'Manager';
  const isAdmin = user.role === 'Admin';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">MedCareX Healthcare System</h1>
              <p className="text-xs text-slate-500">
                Signed in as <strong>{user.name}</strong> ({user.role})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === tab.id ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setToken('');
                setUser(null);
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        {statusMessage && (
          <div className="flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-xs font-medium text-teal-900">
            <span>{statusMessage}</span>
            <button type="button" onClick={() => setStatusMessage('')} className="font-bold">
              Dismiss
            </button>
          </div>
        )}

        {activeTab === 'dashboard' && summary && (
          <>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Total Patients</span>
                  <Users className="h-4 w-4 text-teal-600" />
                </div>
                <p className="mt-2 text-2xl font-bold">{summary.kpis.totalPatients}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Active Doctors</span>
                  <Stethoscope className="h-4 w-4 text-indigo-600" />
                </div>
                <p className="mt-2 text-2xl font-bold">{summary.kpis.totalDoctors}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Scheduled Appointments</span>
                  <CalendarClock className="h-4 w-4 text-amber-600" />
                </div>
                <p className="mt-2 text-2xl font-bold">{summary.kpis.scheduledAppointments}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Completed Visits</span>
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="mt-2 text-2xl font-bold">{summary.kpis.completedAppointments}</p>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <section className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="text-sm font-semibold">Clinical Departments</h2>
                <ul className="mt-3 divide-y divide-slate-100 text-xs">
                  {summary.departments.map((d) => (
                    <li key={d.id} className="flex items-center justify-between py-2.5">
                      <div>
                        <p className="font-semibold text-slate-900">{d.name}</p>
                        <p className="text-slate-500">{d.floor}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium">{d.doctorCount} doctors</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="text-sm font-semibold">Recent Activity Logs</h2>
                <ul className="mt-3 divide-y divide-slate-100 text-xs">
                  {summary.recentActivity.map((item) => (
                    <li key={item.id} className="py-2.5">
                      <p className="font-semibold text-slate-900">{item.action}</p>
                      <p className="text-slate-500">
                        {item.actor} ({item.role}) · {item.resource}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </>
        )}

        {activeTab === 'patients' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-4">
              <h2 className="text-sm font-semibold">
                {editingPatientId ? `Edit Patient #${editingPatientId}` : 'Register Patient'}
              </h2>
              <form onSubmit={handleSavePatient} className="mt-3 space-y-3 text-xs">
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={patientForm.fullName}
                  onChange={(e) => setPatientForm((p) => ({ ...p, fullName: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    required
                    placeholder="Age"
                    value={patientForm.age}
                    onChange={(e) => setPatientForm((p) => ({ ...p, age: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <select
                    value={patientForm.gender}
                    onChange={(e) => setPatientForm((p) => ({ ...p, gender: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Phone"
                    value={patientForm.phone}
                    onChange={(e) => setPatientForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Blood Group"
                    value={patientForm.bloodGroup}
                    onChange={(e) => setPatientForm((p) => ({ ...p, bloodGroup: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <select
                  value={patientForm.primaryDoctorId}
                  onChange={(e) => setPatientForm((p) => ({ ...p, primaryDoctorId: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="">Assign Primary Doctor (Optional)</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialization})
                    </option>
                  ))}
                </select>
                <textarea
                  rows={2}
                  placeholder="Clinical Notes"
                  value={patientForm.notes}
                  onChange={(e) => setPatientForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-teal-600 py-2 font-semibold text-white hover:bg-teal-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {editingPatientId ? 'Update Patient' : 'Add Patient'}
                  </button>
                  {editingPatientId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPatientId(null);
                        setPatientForm({
                          fullName: '',
                          age: '',
                          gender: 'Male',
                          phone: '',
                          bloodGroup: 'O+',
                          notes: '',
                          primaryDoctorId: '',
                        });
                      }}
                      className="rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-8">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">Patient Directory ({patients.length})</h2>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="search"
                    placeholder="Search name or phone..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs"
                  />
                </div>
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500">
                      <th className="py-2">Patient</th>
                      <th className="py-2">Age / Blood</th>
                      <th className="py-2">Primary Doctor</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patients.map((pt) => (
                      <tr key={pt.id}>
                        <td className="py-2.5">
                          <p className="font-semibold">{pt.fullName}</p>
                          <p className="text-slate-500">{pt.phone}</p>
                          {pt.notes && <p className="mt-0.5 text-[11px] text-slate-400">{pt.notes}</p>}
                        </td>
                        <td className="py-2.5">
                          {pt.age}y · {pt.gender} · {pt.bloodGroup || 'N/A'}
                        </td>
                        <td className="py-2.5">{pt.primaryDoctor?.name || 'Unassigned'}</td>
                        <td className="py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPatientId(pt.id);
                              setPatientForm({
                                fullName: pt.fullName,
                                age: String(pt.age),
                                gender: pt.gender,
                                phone: pt.phone,
                                bloodGroup: pt.bloodGroup || '',
                                notes: pt.notes || '',
                                primaryDoctorId: pt.primaryDoctorId ? String(pt.primaryDoctorId) : '',
                              });
                            }}
                            className="mr-2 font-semibold text-teal-700"
                          >
                            Edit
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeletePatient(pt.id)}
                              className="inline-flex items-center gap-0.5 font-semibold text-rose-600"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-4">
              <h2 className="text-sm font-semibold">
                {editingDoctorId ? `Edit Doctor #${editingDoctorId}` : 'Add Doctor Profile'}
              </h2>
              {!isAdminOrManager ? (
                <p className="mt-2 text-xs text-slate-500">Admin or Manager role required to manage doctors.</p>
              ) : (
                <form onSubmit={handleSaveDoctor} className="mt-3 space-y-3 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Doctor Name"
                    value={doctorForm.name}
                    onChange={(e) => setDoctorForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Specialization"
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm((p) => ({ ...p, specialization: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <input
                    type="text"
                    required
                    placeholder="License No (e.g., MCI-88120)"
                    value={doctorForm.licenseNo}
                    onChange={(e) => setDoctorForm((p) => ({ ...p, licenseNo: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <select
                    required
                    value={doctorForm.departmentId}
                    onChange={(e) => setDoctorForm((p) => ({ ...p, departmentId: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 rounded-lg bg-teal-600 py-2 font-semibold text-white hover:bg-teal-700"
                    >
                      {editingDoctorId ? 'Update Doctor' : 'Add Doctor'}
                    </button>
                    {editingDoctorId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDoctorId(null);
                          setDoctorForm({ name: '', specialization: '', licenseNo: '', phone: '', departmentId: '' });
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8">
              {doctors.map((doc) => (
                <div key={doc.id} className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 text-xs">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{doc.name}</p>
                    <p className="text-teal-700">{doc.specialization}</p>
                    <p className="mt-2 text-slate-500">
                      Department: {doc.department?.name} · License: {doc.licenseNo}
                    </p>
                    <p className="mt-1 text-slate-500">{doc.availability}</p>
                  </div>
                  {isAdminOrManager && (
                    <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDoctorId(doc.id);
                          setDoctorForm({
                            name: doc.name,
                            specialization: doc.specialization,
                            licenseNo: doc.licenseNo,
                            phone: doc.phone || '',
                            departmentId: String(doc.departmentId),
                          });
                        }}
                        className="font-semibold text-teal-700"
                      >
                        Edit / Reassign
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDeleteDoctor(doc.id)}
                          className="font-semibold text-rose-600"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </section>
          </div>
        )}

        {activeTab === 'departments' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-4">
              <h2 className="text-sm font-semibold">
                {editingDepartmentId ? `Edit Department #${editingDepartmentId}` : 'Add Clinical Department'}
              </h2>
              {!isAdminOrManager ? (
                <p className="mt-2 text-xs text-slate-500">Admin or Manager role required to manage departments.</p>
              ) : (
                <form onSubmit={handleSaveDepartment} className="mt-3 space-y-3 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Department Name (e.g., Dermatology)"
                    value={departmentForm.name}
                    onChange={(e) => setDepartmentForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Floor / Wing (e.g., Floor 2 · Wing B)"
                    value={departmentForm.floor}
                    onChange={(e) => setDepartmentForm((p) => ({ ...p, floor: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 rounded-lg bg-teal-600 py-2 font-semibold text-white hover:bg-teal-700"
                    >
                      {editingDepartmentId ? 'Update Department' : 'Create Department'}
                    </button>
                    {editingDepartmentId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDepartmentId(null);
                          setDepartmentForm({ name: '', floor: '' });
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-8">
              <h2 className="text-sm font-semibold">Departments Directory ({departments.length})</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500">
                      <th className="py-2">Department</th>
                      <th className="py-2">Location</th>
                      <th className="py-2">Assigned Doctors</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {departments.map((dept) => (
                      <tr key={dept.id}>
                        <td className="py-2.5 font-semibold">{dept.name}</td>
                        <td className="py-2.5 text-slate-500">{dept.floor || 'Main Building'}</td>
                        <td className="py-2.5">{dept.doctors?.length || 0}</td>
                        <td className="py-2.5 text-right">
                          {isAdminOrManager && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDepartmentId(dept.id);
                                setDepartmentForm({ name: dept.name, floor: dept.floor || '' });
                              }}
                              className="mr-2 font-semibold text-teal-700"
                            >
                              Edit
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteDepartment(dept.id)}
                              className="font-semibold text-rose-600"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-4">
              <h2 className="text-sm font-semibold">Book Appointment</h2>
              <form onSubmit={handleBookAppointment} className="mt-3 space-y-3 text-xs">
                <select
                  required
                  value={apptForm.patientId}
                  onChange={(e) => setApptForm((p) => ({ ...p, patientId: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="">Select Patient</option>
                  {patients.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.fullName}
                    </option>
                  ))}
                </select>
                <select
                  required
                  value={apptForm.doctorId}
                  onChange={(e) => setApptForm((p) => ({ ...p, doctorId: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialization})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  value={apptForm.scheduledAt}
                  onChange={(e) => setApptForm((p) => ({ ...p, scheduledAt: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                <input
                  type="text"
                  required
                  placeholder="Visit Reason"
                  value={apptForm.reason}
                  onChange={(e) => setApptForm((p) => ({ ...p, reason: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-teal-600 py-2 font-semibold text-white hover:bg-teal-700"
                >
                  Schedule Appointment
                </button>
              </form>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-8">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">Appointment Queue & History ({appointments.length})</h2>
                <select
                  aria-label="Filter appointments by status"
                  value={appointmentStatusFilter}
                  onChange={(e) => setAppointmentStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700"
                >
                  <option value="All">All Statuses</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500">
                      <th className="py-2">Patient</th>
                      <th className="py-2">Doctor</th>
                      <th className="py-2">Schedule & Reason</th>
                      <th className="py-2">Status</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments
                      .filter((appt) => appointmentStatusFilter === 'All' || appt.status === appointmentStatusFilter)
                      .map((appt) => (
                      <tr key={appt.id}>
                        <td className="py-2.5 font-semibold">{appt.patient?.fullName}</td>
                        <td className="py-2.5">{appt.doctor?.name}</td>
                        <td className="py-2.5">
                          <p>{appt.scheduledAt}</p>
                          <p className="text-slate-500">{appt.reason}</p>
                        </td>
                        <td className="py-2.5 font-semibold">{appt.status}</td>
                        <td className="py-2.5 text-right">
                          {isAdminOrManager && appt.status === 'Scheduled' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAppointmentStatus(appt.id, 'Completed')}
                                className="mr-2 font-semibold text-emerald-700"
                              >
                                Complete
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAppointmentStatus(appt.id, 'Cancelled')}
                                className="font-semibold text-rose-600"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'activity' && (
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-teal-600" />
              <h2 className="text-sm font-semibold">System Audit & Activity Logs ({logs.length})</h2>
            </div>
            <ul className="mt-3 divide-y divide-slate-100 text-xs">
              {logs.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <div>
                    <p className="font-semibold text-slate-900">{entry.action}</p>
                    <p className="text-slate-500">
                      {entry.actor} ({entry.role}) · {entry.resource}
                    </p>
                  </div>
                  <span className="text-slate-400">{new Date(entry.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
