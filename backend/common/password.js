async function hashPassword(password) {
  return String(password || '');
}

async function comparePassword(plainTextPassword, storedPassword) {
  if (!storedPassword) {
    return false;
  }

  return String(plainTextPassword || '') === String(storedPassword || '');
}

module.exports = {
  hashPassword,
  comparePassword,
};
