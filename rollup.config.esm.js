const babel = require('@rollup/plugin-babel');
const { nodeResolve } = require('@rollup/plugin-node-resolve');

module.exports = {
  input: 'src/jslogger.js',
  output: {
    file: 'dist/jslogger.esm.js',
    format: 'es'
  },
  plugins: [
    nodeResolve({
      browser: true
    }),
    babel.default({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-env', {
          targets: {
            browsers: ['> 1%', 'last 2 versions', 'not dead', 'not ie 11']
          },
          modules: false
        }]
      ]
    })
  ]
};