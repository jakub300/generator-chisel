function sortObject(obj, keyOrder, dontSortByUnicode) {
  if (!obj) return;
  const res = {};

  if (keyOrder) {
    keyOrder.forEach((key) => {
      if (obj.hasOwnProperty(key)) {
        res[key] = obj[key];
        delete obj[key];
      }
    });
  }

  const keys = Object.keys(obj);

  !dontSortByUnicode && keys.sort();
  keys.forEach((key) => {
    res[key] = obj[key];
  });

  return res;
}

module.exports = function sortPackage(pkg) {
  // TODO: cleanup names

  pkg.dependencies = sortObject(this.pkg.dependencies);
  pkg.devDependencies = sortObject(this.pkg.devDependencies);
  pkg.scripts = sortObject(this.pkg.scripts, [
    'serve',
    'build',
    'test:unit',
    'test:e2e',
    'lint',
    'deploy',
  ]);
  pkg = sortObject(this.pkg, [
    'name',
    'version',
    'private',
    'description',
    'author',
    'scripts',
    'main',
    'module',
    'browser',
    'jsDelivr',
    'unpkg',
    'files',
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'vue',
    'babel',
    'eslintConfig',
    'prettier',
    'postcss',
    'browserslist',
    'jest',
  ]);

  return pkg;
};
