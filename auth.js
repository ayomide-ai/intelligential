// auth.js
// Frontend-only demo auth using Web Crypto SHA-256 hashing + localStorage.
// Not production secure — good for prototyping / demos only.

/*
Storage layout (localStorage):
- int_users -> JSON stringified array of users:
    [{ email, name, passwordHash, createdAt }]
- int_token -> demo session token (opaque)
- int_user -> JSON stringified current user object { email, name }
*/

const USER_KEY = 'int_users';
const TOKEN_KEY = 'int_token';
const USER_OBJ_KEY = 'int_user';

// Utility: SHA-256 hash a UTF-8 string using Web Crypto and return hex string
async function sha256Hex(message) {
  const enc = new TextEncoder();
  const data = enc.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Get users array from localStorage
function getUsers() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// Save users array
function saveUsers(users) {
  localStorage.setItem(USER_KEY, JSON.stringify(users));
}

// Create opaque demo token
function createDemoToken(email) {
  const rnd = Math.floor(Math.random() * 1e9);
  return btoa(`${email}::${Date.now()}::${rnd}`);
}

// Public: sign up new user
// form should have inputs: name, email, password, confirm_password
async function signupDemo(event) {
  if (event) event.preventDefault();
  const form = event?.target || document.getElementById('signup-form');
  const name = form.querySelector('[name="name"]').value.trim();
  const email = form.querySelector('[name="email"]').value.trim().toLowerCase();
  const password = form.querySelector('[name="password"]').value;
  const confirm = form.querySelector('[name="confirm_password"]').value;

  // Basic validation
  if (!name || !email || !password || !confirm) {
    alert('Please fill all fields.');
    return;
  }
  if (password !== confirm) {
    alert('Passwords do not match.');
    return;
  }
  if (!validateEmail(email)) {
    alert('Enter a valid email address.');
    return;
  }
  const pwOk = passwordStrength(password);
  if (!pwOk.ok) {
    alert('Password problem: ' + pwOk.reason);
    return;
  }

  // Check uniqueness
  const users = getUsers();
  if (users.some(u => u.email === email)) {
    alert('An account with this email already exists. Please login or use a different email.');
    return;
  }

  // Hash the password
  const passwordHash = await sha256Hex(password);

  // Create user object
  const user = {
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString()
  };
  users.push(user);
  saveUsers(users);

  // Auto-login after signup (demo)
  const token = createDemoToken(email);
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_OBJ_KEY, JSON.stringify({ name, email }));

  // Redirect to dashboard
  window.location.href = './dashboard.html';
}

// Public: login
// form should have inputs: email, password
async function loginDemo(event) {
  if (event) event.preventDefault();
  const form = event?.target || document.getElementById('login-form');
  const email = form.querySelector('[name="email"]').value.trim().toLowerCase();
  const password = form.querySelector('[name="password"]').value;

  if (!email || !password) {
    alert('Enter email and password.');
    return;
  }

  const users = getUsers();
  const user = users.find(u => u.email === email);
  if (!user) {
    alert('No account found for this email. Please sign up first.');
    return;
  }

  const passwordHash = await sha256Hex(password);
  if (passwordHash !== user.passwordHash) {
    alert('Incorrect password.');
    return;
  }

  // Success
  const token = createDemoToken(email);
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_OBJ_KEY, JSON.stringify({ name: user.name, email: user.email }));

  // Redirect to dashboard
  window.location.href = './dashboard.html';
}

// Logout helper
function logoutDemo() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_OBJ_KEY);
  // Optionally redirect to login page
  window.location.href = './login.html';
}

// Check auth: if token missing and redirect flag true, redirect to login
function requireAuth(redirectIfMissing = true) {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    if (redirectIfMissing) window.location.href = './login.html';
    return false;
  }
  return true;
}

// Get current user object from storage
function currentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_OBJ_KEY) || 'null');
  } catch (e) {
    return null;
  }
}

// Validate email simple
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Basic password strength checker
function passwordStrength(password) {
  if (password.length < 8) return { ok: false, reason: 'Password must be at least 8 characters' };
  if (!/[A-Z]/.test(password)) return { ok: false, reason: 'Add at least one uppercase letter' };
  if (!/[a-z]/.test(password)) return { ok: false, reason: 'Add at least one lowercase letter' };
  if (!/[0-9]/.test(password)) return { ok: false, reason: 'Add at least one number' };
  // optional: require symbol
  // if (!/[!@#\$%\^&\*]/.test(password)) return { ok:false, reason: 'Add a special character' };
  return { ok: true };
}

// Used to show/hide password strength UI realtime (optional)
function bindPasswordStrength(inputEl, feedbackEl) {
  inputEl.addEventListener('input', () => {
    const s = passwordStrength(inputEl.value);
    feedbackEl.textContent = s.ok ? 'Strong password' : s.reason;
    feedbackEl.style.color = s.ok ? 'green' : 'crimson';
  });
}

// For debugging: clear all demo users (not used in production)
function clearDemoUsers() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_OBJ_KEY);
  alert('Demo data cleared.');
}

// Export functions to window for HTML pages to call
window.signupDemo = signupDemo;
window.loginDemo = loginDemo;
window.logoutDemo = logoutDemo;
window.requireAuth = requireAuth;
window.currentUser = currentUser;
window.bindPasswordStrength = bindPasswordStrength;
window.clearDemoUsers = clearDemoUsers;
