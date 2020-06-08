module.exports = {
  presets: [
    [
      'chisel',
      {
        // global automatic polyfills:
        // yarn add core-js then uncomment
        // useBuiltIns: 'usage',
      },
    ],
    // ['chisel/react'],
    // ['chisel/preact'],
  ],
};
