module.exports = {
  presets: [
    [
      'bebel-preset-chisel',
      {
        // global automatic polyfills:
        // yarn add core-js then uncomment
        // useBuiltIns: 'usage',
      },
    ],
    // [
    //   'babel-preset-chisel/react',
    //   { hot: require('./chisel.config.js').reactHotReload },
    // ],
    // ['bebel-preset-chisel/preact'],
  ],
};
