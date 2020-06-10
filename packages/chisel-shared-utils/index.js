['package-manager', 'run', 'copy'].forEach((lib) => {
  Object.assign(exports, require(`./lib/${lib}`));
});
