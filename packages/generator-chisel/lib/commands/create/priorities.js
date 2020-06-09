module.exports = {
  // Basic:
  PROMPT: 100,

  // we can copy wp files here
  // downloading WP seems to preserve files created earlier
  COPY: 500,

  // UPDATE_CONFIG: 900,

  INSTALL_DEPENDENCIES: 1000,

  // we need chisel-scripts and plugins installed to run wp commands
  // we separate different steps as future proofing
  WP_DOWNLOAD: 1100,
  WP_INSTALL: 1200,
  WP_THEME_ACTIVATE: 1300,
  WP_PLUGINS: 1400,
};
