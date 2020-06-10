function run(args, options = {}) {
  const { silent = false, cwd, reject = true, execaOpts = {} } = options;
  const { interactive = !silent } = options;

  const execa = require('execa');
  const execaOptsNormalized = {
    stdio: [interactive ? 'inherit' : 'pipe', 'pipe', 'pipe'],
    cwd,
    reject,
    ...execaOpts,
  };

  const run = execa(args[0], args.slice(1), execaOptsNormalized);

  if (!silent) {
    run.stdout.pipe(process.stdout);
    run.stderr.pipe(process.stderr);
  }

  return run;
}

module.exports.run = run;

function runLocal(args, options = {}) {
  const { hasYarn } = require('./package-manager');
  const start = hasYarn() ? ['yarn', '--silent'] : ['npx'];
  return run([...start, ...args], options);
}

module.exports.runLocal = runLocal;
