function generateId(prefix) {
  return `${prefix}${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
}

module.exports = {
  generateId,
};
