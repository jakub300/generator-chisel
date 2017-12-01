'use strict';

const path = require('path');
const through = require('through2');
const childProcess = require('child_process');
const Vinyl = require('vinyl');

const GENERATE_REPORT_TIMEOUT = 20000;
const GENERATE_REPORT_BUFFER = 10 * 1024 * 1024;

function generateReports() {
  return through.obj(function removeSourceMap(file, enc, callback) {
    const map = childProcess.spawnSync('source-map-explorer', [file.path]);
    console.log(map.length, map);
    console.log(map.stdout.length, map.stderr.length);
    this.push(
      new Vinyl({
        path: `${path.basename(file.path)}.html`,
        contents: map.stdout,
      })
    );
    callback();
  });
}

module.exports = function scriptsTask(gulp, plugins, config, helpers) {
  gulp.task('scripts-report-pre', () => {
    process.env.NODE_ENV = 'production';
    process.env.CHISEL_SCRIPTS_REPORT = '1';
  });

  gulp.task('scripts-report', ['scripts-report-pre', 'build'], () =>
    gulp
      .src(path.join(config.dest.base, config.dest.scripts, '*.js'))
      .pipe(helpers.onlyWithSourceMap())
      .pipe(generateReports())
      .pipe(gulp.dest(path.join(config.dest.base, 'scripts-reports')))
  );
};
