// ============================================
//  AUTH SYSTEM — Employee Dashboard Logic
// ============================================

(function () {
  'use strict';

  // ---- Constants ----
  const API = {
    PROFILE: '/api/auth/profile',
    EMPLOYEE_DASH: '/api/employee/dashboard',
    UPDATE_PROFILE: '/api/users/profile',
  };

  const TOKEN_KEY = 'auth_token';
  const REQUIRED_ROLE = 'employee';

  const ROLE_DASHBOARDS = {
    admin: 'admin-dashboard.html',
    manager: 'manager-dashboard.html',
    employee: 'employee-dashboard.html',
  };

  // ---- Helpers ----
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ---- State ----
  let currentUser = null;

  // ---- Check token ----
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  // ============================================
  //  TOAST NOTIFICATIONS
  // ============================================
  const toastContainer = $('#toastContainer');

  function showToast(message, type = 'info') {
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" aria-label="Close">✕</button>
      <div class="toast-progress"></div>
    `;
    toastContainer.appendChild(toast);
    toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));
    setTimeout(() => removeToast(toast), 4000);
  }

  function removeToast(toast) {
    if (!toast.parentNode) return;
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }

  // ============================================
  //  API HELPER
  // ============================================
  async function apiFetch(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      showToast('Session expired. Redirecting to login...', 'error');
      localStorage.removeItem(TOKEN_KEY);
      setTimeout(() => (window.location.href = 'index.html'), 1200);
      throw new Error('Unauthorized');
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Request failed');
    return data;
  }

  // ============================================
  //  SIDEBAR NAVIGATION
  // ============================================
  function initNavigation() {
    $$('.nav-link[data-section]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('data-section');
        activateSection(section);

        // Close mobile sidebar
        $('#sidebar').classList.remove('open');
        $('#sidebarOverlay').classList.remove('show');
      });
    });
  }

  function activateSection(sectionName) {
    // Update nav links
    $$('.nav-link').forEach((l) => l.classList.remove('active'));
    const activeLink = $(`.nav-link[data-section="${sectionName}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Show section
    $$('.content-section').forEach((s) => s.classList.remove('active'));
    const sectionMap = {
      overview: '#sectionOverview',
      tasks: '#sectionTasks',
      profile: '#sectionProfile',
    };
    const target = $(sectionMap[sectionName]);
    if (target) target.classList.add('active');
  }

  // ---- Mobile Sidebar ----
  const mobileToggle = $('#mobileToggle');
  const sidebar = $('#sidebar');
  const sidebarOverlay = $('#sidebarOverlay');

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      sidebarOverlay.classList.toggle('show');
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('show');
    });
  }

  // ---- Logout ----
  $('#logoutBtn').addEventListener('click', () => {
    localStorage.removeItem(TOKEN_KEY);
    showToast('Signed out successfully', 'info');
    setTimeout(() => (window.location.href = 'index.html'), 600);
  });

  // ============================================
  //  INIT DASHBOARD
  // ============================================
  async function init() {
    try {
      // Fetch profile
      const response = await apiFetch(API.PROFILE);
      const userData = response.data ? response.data.user : (response.user || response);
      currentUser = userData;

      // Role guard — redirect if not employee
      if (currentUser.role !== REQUIRED_ROLE) {
        const redirect = ROLE_DASHBOARDS[currentUser.role] || 'index.html';
        window.location.href = redirect;
        return;
      }

      renderUserInfo(currentUser);
      hideLoader();

      // Load employee-specific data
      loadEmployeeDashboard();

      // Setup profile update
      setupProfileUpdate();

    } catch (err) {
      if (err.message !== 'Unauthorized') {
        showToast('Failed to load profile: ' + err.message, 'error');
        hideLoader();
      }
    }
  }

  function hideLoader() {
    const loader = $('#pageLoader');
    loader.classList.add('hidden');
    setTimeout(() => (loader.style.display = 'none'), 500);
  }

  // ============================================
  //  RENDER USER INFO
  // ============================================
  function renderUserInfo(user) {
    const initials = getInitials(user.name);

    // Sidebar
    $('#sidebarAvatar').textContent = initials;
    $('#sidebarName').textContent = user.name;
    $('#sidebarEmail').textContent = user.email;

    const badge = $('#sidebarRoleBadge');
    badge.textContent = capitalize(user.role);
    badge.className = `role-badge ${user.role}`;

    // Header
    $('#headerName').textContent = user.name.split(' ')[0];
    $('#headerAvatar').textContent = initials;
    $('#headerSubtitle').textContent = 'Team Member Dashboard';

    // Profile section
    $('#profileName').textContent = user.name;
    $('#profileEmail').textContent = user.email;
    $('#profileRole').innerHTML = `<span class="role-badge ${user.role}" style="margin:0;">${capitalize(user.role)}</span>`;
    $('#profileId').textContent = user._id || user.id || '—';
    $('#profileCreated').textContent = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '—';

    // Pre-fill edit name
    $('#editNameInput').value = user.name;
  }

  function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }

  // ============================================
  //  EMPLOYEE DASHBOARD DATA
  // ============================================
  async function loadEmployeeDashboard() {
    const container = $('#employeeDashContent');
    const announcementsContainer = $('#announcementsContainer');

    try {
      const response = await apiFetch(API.EMPLOYEE_DASH);
      const data = response.data || response;
      const dashboard = data.dashboard || data;

      let html = '';

      // Welcome message
      if (dashboard.welcomeMessage) {
        html += `
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
            <span style="font-size:28px;">🎯</span>
            <div>
              <h3 style="font-size:16px; font-weight:700; margin-bottom:4px;">Dashboard</h3>
              <p style="font-size:14px; color:var(--text-secondary);">${dashboard.welcomeMessage}</p>
            </div>
          </div>
        `;
      } else {
        html += `
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:28px;">✅</span>
            <div>
              <h3 style="font-size:16px; font-weight:700; margin-bottom:4px;">All caught up!</h3>
              <p style="font-size:14px; color:var(--text-secondary);">Your dashboard data has been loaded successfully.</p>
            </div>
          </div>
        `;
      }

      if (dashboard.role) {
        html += `
          <div style="margin-top:12px; padding:10px 16px; background:rgba(255,107,0,0.05); border-radius:8px; display:inline-flex; align-items:center; gap:8px;">
            <span style="font-size:14px;">🏷️</span>
            <span style="font-size:13px; font-weight:600; color:var(--text-secondary);">Role: ${capitalize(dashboard.role)}</span>
          </div>
        `;
      }

      container.innerHTML = html;

      // Render API announcements if available
      if (dashboard.announcements && Array.isArray(dashboard.announcements) && dashboard.announcements.length > 0) {
        announcementsContainer.innerHTML = dashboard.announcements
          .map((a) => `
            <div class="announcement-item">
              <h4>${a.title || 'Announcement'}</h4>
              <p>${a.content || a.message || a}</p>
              ${a.date ? `<div class="announcement-date">${new Date(a.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>` : ''}
            </div>
          `)
          .join('');
      }
      // Otherwise, keep the static announcements from HTML

    } catch (err) {
      container.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:28px;">✅</span>
          <div>
            <h3 style="font-size:16px; font-weight:700; margin-bottom:4px;">Dashboard Ready</h3>
            <p style="font-size:14px; color:var(--text-secondary);">Check your tasks and announcements below.</p>
          </div>
        </div>
      `;
    }
  }

  // ============================================
  //  PROFILE UPDATE
  // ============================================
  function setupProfileUpdate() {
    const btn = $('#updateNameBtn');
    const input = $('#editNameInput');

    btn.addEventListener('click', async () => {
      const newName = input.value.trim();
      if (!newName) {
        showToast('Please enter a valid name', 'warning');
        return;
      }

      if (newName === currentUser.name) {
        showToast('Name is already set to this value', 'info');
        return;
      }

      try {
        btn.disabled = true;
        btn.textContent = '⏳ Updating...';

        await apiFetch(API.UPDATE_PROFILE, {
          method: 'PATCH',
          body: JSON.stringify({ name: newName }),
        });

        currentUser.name = newName;
        renderUserInfo(currentUser);
        showToast('Name updated successfully!', 'success');
      } catch (err) {
        showToast('Failed to update name: ' + err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = '💾 Update';
      }
    });
  }

  // ============================================
  //  INITIALIZE
  // ============================================
  initNavigation();
  init();
})();
