// ============================================
//  AUTH SYSTEM — Admin Dashboard Logic
// ============================================

(function () {
  'use strict';

  // ---- Constants ----
  const API = {
    PROFILE: '/api/auth/profile',
    ADMIN_USERS: '/api/admin/users',
    UPDATE_PROFILE: '/api/users/profile',
  };

  const TOKEN_KEY = 'auth_token';
  const REQUIRED_ROLE = 'admin';

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
  //  CONFIRM MODAL
  // ============================================
  function showConfirm(title, message) {
    return new Promise((resolve) => {
      const modal = $('#confirmModal');
      modal.innerHTML = `
        <div class="modal-overlay" id="modalOverlay">
          <div class="modal-card">
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="modal-actions">
              <button class="btn-modal btn-cancel" id="modalCancel">Cancel</button>
              <button class="btn-modal btn-confirm-delete" id="modalConfirm">Confirm</button>
            </div>
          </div>
        </div>
      `;
      $('#modalCancel').addEventListener('click', () => {
        modal.innerHTML = '';
        resolve(false);
      });
      $('#modalConfirm').addEventListener('click', () => {
        modal.innerHTML = '';
        resolve(true);
      });
      $('#modalOverlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
          modal.innerHTML = '';
          resolve(false);
        }
      });
    });
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
      users: '#sectionUsers',
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

      // Role guard — redirect if not admin
      if (currentUser.role !== REQUIRED_ROLE) {
        const redirect = ROLE_DASHBOARDS[currentUser.role] || 'index.html';
        window.location.href = redirect;
        return;
      }

      renderUserInfo(currentUser);
      hideLoader();

      // Load admin-specific data
      loadAdminUsers();

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
    $('#headerSubtitle').textContent = 'System Administrator Dashboard';

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
  //  ADMIN — USER MANAGEMENT
  // ============================================
  async function loadAdminUsers() {
    try {
      const response = await apiFetch(`${API.ADMIN_USERS}?limit=100`);
      const data = response.data || response;
      const users = data.users || (Array.isArray(data) ? data : []);

      renderUsersTable(users);
      updateStatCounts(users);

    } catch (err) {
      $('#usersTableBody').innerHTML = `
        <tr><td colspan="5">
          <div class="empty-state">
            <div class="empty-icon">⚠️</div>
            <p>Could not load users: ${err.message}</p>
          </div>
        </td></tr>
      `;
    }
  }

  function updateStatCounts(users) {
    const counts = { admin: 0, manager: 0, employee: 0 };
    users.forEach((u) => {
      if (counts.hasOwnProperty(u.role)) counts[u.role]++;
    });

    $('#statTotalUsers').textContent = users.length;
    $('#statAdmins').textContent = counts.admin;
    $('#statManagers').textContent = counts.manager;
    $('#statEmployees').textContent = counts.employee;
  }

  function renderUsersTable(users) {
    const tbody = $('#usersTableBody');

    if (!users.length) {
      tbody.innerHTML = `
        <tr><td colspan="5">
          <div class="empty-state">
            <div class="empty-icon">👥</div>
            <p>No users found.</p>
          </div>
        </td></tr>
      `;
      return;
    }

    tbody.innerHTML = users
      .map((user) => {
        const userId = user._id || user.id;
        const isCurrentUser = userId === (currentUser._id || currentUser.id);
        const created = user.createdAt
          ? new Date(user.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '—';

        return `
        <tr data-user-id="${userId}">
          <td>
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="width:34px; height:34px; border-radius:50%; background:var(--gradient-main); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:#fff; flex-shrink:0;">
                ${getInitials(user.name)}
              </div>
              <div>
                <div style="font-weight:600; color:var(--text-primary); font-size:13px;">${user.name}</div>
                ${isCurrentUser ? '<span style="font-size:10px; color:var(--accent-purple); font-weight:600;">(You)</span>' : ''}
              </div>
            </div>
          </td>
          <td>${user.email}</td>
          <td>
            <select class="role-select" data-user-id="${userId}" data-original-role="${user.role}" ${isCurrentUser ? 'disabled' : ''}>
              <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
              <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>Manager</option>
              <option value="employee" ${user.role === 'employee' ? 'selected' : ''}>Employee</option>
            </select>
          </td>
          <td>${created}</td>
          <td>
            <div class="table-actions">
              ${isCurrentUser ? '' : `
                <button class="btn-action btn-save" data-save-role="${userId}" title="Save role change">
                  💾 Save
                </button>
                <button class="btn-action btn-delete" data-delete-user="${userId}" title="Delete user">
                  🗑️ Delete
                </button>
              `}
            </div>
          </td>
        </tr>
      `;
      })
      .join('');

    // Attach event listeners
    $$('[data-save-role]').forEach((btn) => {
      btn.addEventListener('click', () => handleRoleChange(btn.dataset.saveRole));
    });

    $$('[data-delete-user]').forEach((btn) => {
      btn.addEventListener('click', () => handleDeleteUser(btn.dataset.deleteUser));
    });
  }

  async function handleRoleChange(userId) {
    const select = $(`.role-select[data-user-id="${userId}"]`);
    if (!select) return;

    const newRole = select.value;
    const originalRole = select.dataset.originalRole;

    if (newRole === originalRole) {
      showToast('Role is already set to ' + newRole, 'info');
      return;
    }

    try {
      await apiFetch(`${API.ADMIN_USERS}/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      });
      select.dataset.originalRole = newRole;
      showToast(`Role updated to ${capitalize(newRole)} successfully`, 'success');

      // Refresh to update counts
      loadAdminUsers();
    } catch (err) {
      showToast('Failed to update role: ' + err.message, 'error');
      select.value = originalRole;
    }
  }

  async function handleDeleteUser(userId) {
    const confirmed = await showConfirm(
      '⚠️ Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      await apiFetch(`${API.ADMIN_USERS}/${userId}`, { method: 'DELETE' });
      showToast('User deleted successfully', 'success');
      loadAdminUsers(); // Refresh table and counts
    } catch (err) {
      showToast('Failed to delete user: ' + err.message, 'error');
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
