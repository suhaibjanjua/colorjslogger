const babel = require('@rollup/plugin-babel');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const terser = require('@rollup/plugin-terser');

module.exports = {
  input: 'src/jslogger.js',
  output: [
    {
      file: 'dist/jslogger.js',
      format: 'umd',
      name: 'ColorJSLogger',
      exports: 'default'
    },
    {
      file: 'dist/jslogger.min.js',
      format: 'umd', 
      name: 'ColorJSLogger',
      exports: 'default',
      plugins: [terser()]
    }
  ],
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
          }
        }]
      ]
    })
  ]
};