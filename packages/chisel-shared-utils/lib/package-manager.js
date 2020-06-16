let _hasYarn = undefined;
function hasYarn() {
  if (_hasYarn !== undefined) return _hasYarn;

  const commandExists = require('command-exists');
  _hasYarn = commandExists.sync('yarn');
  return _hasYarn;
}

module.exports.hasYarn = hasYarn;

function installDependencies(opts = {}) {
  const execa = require('execa');

  return execa(hasYarn() ? 'yarn' : 'npm', ['install'], { stdio: 'inherit', ...opts });
}

module.exports.installDependencies = installDependencies;
