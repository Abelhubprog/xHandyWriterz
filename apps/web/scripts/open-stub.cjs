module.exports = async function openStub() {
  return { pid: 0 };
};

module.exports.default = module.exports;
module.exports.openApp = async function openApp() {
  return { pid: 0 };
};
