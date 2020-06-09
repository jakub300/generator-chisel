let _hasYarn = undefined;
function hasYarn() {
  if (_hasYarn !== undefined) return _hasYarn;

  const commandExists = require('command-exists');
  _hasYarn = commandExists.sync('yarn');
  return _hasYarn;
}

module.exports.installDependencies = async function installDependencies() {
  const execa = require('execa');

  return execa(hasYarn() ? 'yarn' : 'npm', ['install'], { stdio: 'inherit' });
};

module.exports.runLocalCommand = function runLocalCommand(args, options = {}) {
  const { silent = false } = options;
  const { interactive = !silent } = options;

  const execa = require('execa');
  const start = hasYarn() ? ['yarn', '--silent'] : ['npx'];
  const execaOpts = {
    stdio: [interactive ? 'inherit' : 'pipe', 'pipe', 'pipe'],
  };

  const run = execa(start[0], [...start.slice(1), ...args], execaOpts);

  if (!silent) {
    run.stdout.pipe(process.stdout);
    run.stderr.pipe(process.stderr);
  }

  return run;
};
