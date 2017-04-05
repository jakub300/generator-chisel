'use strict';

var path = require('path');
var fs = require('fs');

var scriptsTask = function (gulp, plugins, config, helpers) {
  function buildScript(watch) {
    var props = {
      entries: path.join(config.src.base, config.src.app),
      debug: true,
      transform: [
        <% if(features.has_babel) { %>
        ['babelify'],
        <% } %><% if(features.has_vue) { %>
        ['vueify', {
          customCompilers: {
            scss: function(content, cb, compiler, filePath) {
              var name = path.relative(config.src.base, filePath).replace('/', '__');
              name = path.basename(name, path.extname(name));
              // TODO no hardcoded paths
              fs.writeFile(
                path.join(config.src.base, 'styles/components/vue', name+'.scss'),
                content,
                function (err) { cb(err, ''); }
              );
            }
          }
        }],
        ['envify', {global: true}],
        <% } %>
      ],
      plugin: []
    };

    <% if(features.has_vue) { %>
    if(watch) {
      props.plugin.push([
        'browserify-hmr',
        {}
      ]);
    } else {
      process.env.NODE_ENV = 'production';
    }
    <% } %>

    var bundler = watch ? plugins.watchify(plugins.browserify(props)) : plugins.browserify(props);

    function rebundle() {
      var stream = bundler.bundle();

      if(watch) {
        return stream
          .on('error', helpers.onError)
          .pipe(plugins.vinylSourceStream('bundle.js'))
          .pipe(plugins.vinylBuffer())
          .pipe(plugins.sourcemaps.init({loadMaps: true}))
          .pipe(plugins.uglify())
          .pipe(plugins.sourcemaps.write('./'))
          .pipe(gulp.dest(path.join(config.dest.base, config.dest.scripts)))<% if(!features.has_vue) { %>
          .pipe(plugins.browserSync.stream());<% } %>
      }

      return stream
        .on('error', helpers.onError)
        .pipe(plugins.vinylSourceStream('bundle.js'))
        .pipe(plugins.vinylBuffer())
        .pipe(plugins.sourcemaps.init({loadMaps: true}))
        .pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write('./'))
        .pipe(plugins.rev())
        .pipe(plugins.revReplace())
        .pipe(gulp.dest(path.join(config.dest.base, config.dest.scripts)))
        .pipe(plugins.rev.manifest({
          path: path.join(config.dest.base, config.dest.revManifest),
          base: config.dest.base,
          merge: true
        }))
        .pipe(gulp.dest(config.dest.base));
    }

    bundler.on('update', rebundle);
    return rebundle();
  }

  gulp.task('scripts-build', () => buildScript(false));
  gulp.task('watchify', () => buildScript(true));
};

module.exports = scriptsTask;
