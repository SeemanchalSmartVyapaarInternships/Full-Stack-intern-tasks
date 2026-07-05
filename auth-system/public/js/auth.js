// ============================================
//  AUTH SYSTEM — Authentication Logic
//  Login, Register, Forgot Password (OTP),
//  Google OAuth, Role-Based Redirect
// ============================================

(function () {
  'use strict';

  // ---- Constants ----
  const API = {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    VERIFY_OTP: '/api/auth/verify-otp',
    RESET_PASSWORD: '/api/auth/reset-password',
    GOOGLE_AUTH: '/api/auth/google',
    GOOGLE_CONFIG: '/api/auth/google/config',
    PROFILE: '/api/auth/profile',
  };

  // Fetch Google Client ID on load
  fetch(API.GOOGLE_CONFIG)
    .then((r) => r.json())
    .then((res) => {
      if (res.success && res.data?.googleClientId) {
        window.__GOOGLE_CLIENT_ID = res.data.googleClientId;
      }
    })
    .catch((err) => console.error('Failed to load Google Client ID:', err));

  const TOKEN_KEY = 'auth_token';

  // Role-based dashboard routing
  const DASHBOARDS = {
    admin: 'admin-dashboard.html',
    manager: 'manager-dashboard.html',
    employee: 'employee-dashboard.html',
  };

  // ---- DOM Helpers ----
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const toastContainer = $('#toastContainer');

  // ---- Redirect if already logged in ----
  const existingToken = localStorage.getItem(TOKEN_KEY);
  if (existingToken) {
    // Verify token and redirect to correct dashboard
    fetch(API.PROFILE, {
      headers: { Authorization: `Bearer ${existingToken}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.user) {
          const role = data.data.user.role;
          window.location.href = DASHBOARDS[role] || DASHBOARDS.employee;
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY));
  }

  // ============================================
  //  TOAST NOTIFICATIONS
  // ============================================
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
  //  TAB SWITCHING
  // ============================================
  const loginTab = $('#loginTab');
  const registerTab = $('#registerTab');
  const tabSlider = $('#tabSlider');
  const loginForm = $('#loginForm');
  const registerForm = $('#registerForm');
  const authTabsSection = $('#authTabsSection');
  const forgotSection = $('#forgotSection');

  function switchTab(tab) {
    if (tab === 'login') {
      loginTab.classList.add('active');
      registerTab.classList.remove('active');
      tabSlider.classList.remove('right');
      loginForm.classList.add('active');
      registerForm.classList.remove('active');
    } else {
      registerTab.classList.add('active');
      loginTab.classList.remove('active');
      tabSlider.classList.add('right');
      registerForm.classList.add('active');
      loginForm.classList.remove('active');
    }
  }

  loginTab.addEventListener('click', () => switchTab('login'));
  registerTab.addEventListener('click', () => switchTab('register'));

  // ============================================
  //  PASSWORD VISIBILITY TOGGLE
  // ============================================
  $$('.password-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.getAttribute('data-target'));
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
      } else {
        input.type = 'password';
        btn.textContent = '👁';
      }
    });
  });

  // ============================================
  //  PASSWORD STRENGTH
  // ============================================
  const regPassword = $('#regPassword');
  const strengthBarFill = $('#strengthBarFill');
  const strengthLabel = $('#strengthLabel');

  function evaluateStrength(password) {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return 'weak';
    if (score <= 2) return 'fair';
    if (score <= 3) return 'good';
    return 'strong';
  }

  regPassword.addEventListener('input', () => {
    const val = regPassword.value;
    if (!val) {
      strengthBarFill.className = 'strength-bar-fill';
      strengthLabel.className = 'strength-label';
      strengthLabel.textContent = '';
      return;
    }
    const level = evaluateStrength(val);
    strengthBarFill.className = `strength-bar-fill ${level}`;
    strengthLabel.className = `strength-label ${level}`;
    strengthLabel.textContent = { weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong' }[level];
  });

  // ============================================
  //  API HELPERS
  // ============================================
  async function apiCall(url, body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Something went wrong');
    return data;
  }

  function setLoading(btn, loading) {
    if (loading) {
      btn.classList.add('loading');
      btn.disabled = true;
    } else {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

  function redirectToDashboard(role) {
    window.location.href = DASHBOARDS[role] || DASHBOARDS.employee;
  }

  // ============================================
  //  LOGIN
  // ============================================
  const loginBtn = $('#loginBtn');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#loginEmail').value.trim();
    const password = $('#loginPassword').value;

    if (!email || !password) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    setLoading(loginBtn, true);
    try {
      const data = await apiCall(API.LOGIN, { email, password });
      const token = data.data?.token || data.token;
      const role = data.data?.user?.role || 'employee';
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        showToast('Login successful! Redirecting...', 'success');
        setTimeout(() => redirectToDashboard(role), 600);
      } else {
        showToast('Login failed. No token received.', 'error');
        setLoading(loginBtn, false);
      }
    } catch (err) {
      showToast(err.message, 'error');
      setLoading(loginBtn, false);
    }
  });

  // ============================================
  //  REGISTER
  // ============================================
  const registerBtn = $('#registerBtn');

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#regName').value.trim();
    const email = $('#regEmail').value.trim();
    const password = $('#regPassword').value;
    const confirmPassword = $('#regConfirmPassword').value;

    if (!name || !email || !password || !confirmPassword) {
      showToast('Please fill in all fields', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters', 'warning');
      return;
    }

    setLoading(registerBtn, true);
    try {
      const data = await apiCall(API.REGISTER, { name, email, password });
      const token = data.data?.token || data.token;
      const role = data.data?.user?.role || 'employee';
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        showToast('Account created! Redirecting...', 'success');
        setTimeout(() => redirectToDashboard(role), 600);
      } else {
        showToast('Account created! Please sign in.', 'success');
        setTimeout(() => switchTab('login'), 800);
        setLoading(registerBtn, false);
      }
    } catch (err) {
      showToast(err.message, 'error');
      setLoading(registerBtn, false);
    }
  });

  // ============================================
  //  FORGOT PASSWORD — 3-Step Flow
  // ============================================
  let forgotEmail = '';
  let resetToken = '';

  // Show forgot password section
  $('#forgotPasswordLink').addEventListener('click', () => {
    authTabsSection.style.display = 'none';
    forgotSection.style.display = 'block';
    showForgotStep(1);
  });

  // Back to login
  $('#backToLogin').addEventListener('click', () => {
    forgotSection.style.display = 'none';
    authTabsSection.style.display = 'block';
  });

  // Back to step 1
  $('#backToStep1').addEventListener('click', () => showForgotStep(1));

  function showForgotStep(step) {
    $$('.forgot-step').forEach((s) => s.classList.remove('active'));
    $(`#forgotStep${step}`).classList.add('active');
  }

  // Step 1: Send OTP
  const sendOtpBtn = $('#sendOtpBtn');
  $('#forgotEmailForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    forgotEmail = $('#forgotEmail').value.trim();
    if (!forgotEmail) {
      showToast('Please enter your email', 'warning');
      return;
    }

    setLoading(sendOtpBtn, true);
    try {
      await apiCall(API.FORGOT_PASSWORD, { email: forgotEmail });
      showToast('OTP sent to your email!', 'success');
      $('#otpEmailDisplay').textContent = forgotEmail;
      showForgotStep(2);
      // Focus first OTP box
      setTimeout(() => $$('.otp-box')[0]?.focus(), 300);
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(sendOtpBtn, false);
  });

  // OTP Input — auto-advance
  const otpBoxes = $$('.otp-box');
  otpBoxes.forEach((box, i) => {
    box.addEventListener('input', (e) => {
      const val = e.target.value;
      if (val && i < 5) otpBoxes[i + 1].focus();
    });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !box.value && i > 0) {
        otpBoxes[i - 1].focus();
      }
    });
    // Handle paste
    box.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData('text').trim();
      if (/^\d{6}$/.test(pasted)) {
        otpBoxes.forEach((b, idx) => { b.value = pasted[idx]; });
        otpBoxes[5].focus();
      }
    });
  });

  // Step 2: Verify OTP
  const verifyOtpBtn = $('#verifyOtpBtn');
  $('#verifyOtpForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const otp = Array.from(otpBoxes).map((b) => b.value).join('');
    if (otp.length !== 6) {
      showToast('Please enter the complete 6-digit code', 'warning');
      return;
    }

    setLoading(verifyOtpBtn, true);
    try {
      const data = await apiCall(API.VERIFY_OTP, { email: forgotEmail, otp });
      resetToken = data.data?.resetToken || data.resetToken;
      showToast('OTP verified!', 'success');
      showForgotStep(3);
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(verifyOtpBtn, false);
  });

  // Step 3: Reset Password
  const resetPasswordBtn = $('#resetPasswordBtn');
  $('#resetPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = $('#newPassword').value;
    const confirmNew = $('#confirmNewPassword').value;

    if (!newPassword || !confirmNew) {
      showToast('Please fill in both fields', 'warning');
      return;
    }
    if (newPassword !== confirmNew) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'warning');
      return;
    }

    setLoading(resetPasswordBtn, true);
    try {
      await apiCall(API.RESET_PASSWORD, { resetToken, newPassword });
      showToast('Password reset successful! Please login.', 'success');
      setTimeout(() => {
        forgotSection.style.display = 'none';
        authTabsSection.style.display = 'block';
        switchTab('login');
      }, 1000);
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(resetPasswordBtn, false);
  });

  // ============================================
  //  GOOGLE SIGN-IN
  // ============================================
  $('#googleSignInBtn').addEventListener('click', () => {
    const clientId = window.__GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'your_google_client_id') {
      showToast('Google Sign-In is not configured yet. Please set GOOGLE_CLIENT_ID in .env', 'warning');
      return;
    }

    // Open Google OAuth consent screen
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/google/callback');
    const scope = encodeURIComponent('openid email profile');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
    window.location.href = authUrl;
  });

  // Handle Google OAuth callback (if access_token is in URL hash)
  if (window.location.hash.includes('access_token')) {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get('access_token');
    if (accessToken) {
      window.location.hash = '';
      (async () => {
        try {
          const data = await apiCall(API.GOOGLE_AUTH, { access_token: accessToken });
          const token = data.data?.token || data.token;
          const role = data.data?.user?.role || 'employee';
          if (token) {
            localStorage.setItem(TOKEN_KEY, token);
            showToast('Google sign-in successful!', 'success');
            setTimeout(() => redirectToDashboard(role), 600);
          }
        } catch (err) {
          showToast('Google sign-in failed: ' + err.message, 'error');
        }
      })();
    }
  }

  // ============================================
  //  HOLOGRAPHIC EFFECT
  // ============================================
  const authCard = $('.auth-card');
  if (authCard) {
    authCard.addEventListener('mousemove', (e) => {
      const rect = authCard.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      authCard.style.setProperty('--holo-x', `${x}%`);
      authCard.style.setProperty('--holo-y', `${y}%`);
    });
  }

})();
