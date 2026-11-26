/**
 * In-memory user store for Week 2 Authentication & RBAC MVP.
 * Replaced by MySQL + Sequelize ORM in Week 3.
 */
const users = [];
let nextId = 1;

export function findUserByEmail(email) {
  const normalized = String(email).trim().toLowerCase();
  return users.find((u) => u.email === normalized) || null;
}

export function findUserById(id) {
  return users.find((u) => u.id === Number(id)) || null;
}

export function createUser({ name, email, passwordHash, role = 'Employee' }) {
  const user = {
    id: nextId++,
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return user;
}

export function listSafeUsers() {
  return users.map(toSafeUser);
}

export function updateUserRole(id, role) {
  const user = findUserById(id);
  if (!user) return null;
  user.role = role;
  return toSafeUser(user);
}

export function toSafeUser(user) {
  if (!user) return null;
  const { passwordHash: _omitted, ...safeUser } = user;
  return safeUser;
}

export function resetUserStore() {
  users.length = 0;
  nextId = 1;
}
