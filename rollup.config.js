const babel = require('@rollup/plugin-babel');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const terser = require('@rollup/plugin-terser');

// One input, three outputs. The UMD and ESM builds were previously two config
// files that differed only by `modules: false` — and even that was redundant,
// since @rollup/plugin-babel tells preset-env that static ESM is supported, so
// the UMD build was already leaving modules untransformed. Rollup needs ES
// module input either way; letting babel emit CJS would break both builds.
const plugins = [
  nodeResolve({ browser: true }),
  babel.default({
    babelHelpers: 'bundled',
    exclude: 'node_modules/**',
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            browsers: ['> 1%', 'last 2 versions', 'not dead', 'not ie 11'],
          },
          modules: false,
        },
      ],
    ],
  }),
];

module.exports = {
  input: 'src/jslogger.js',
  output: [
    {
      file: 'dist/jslogger.js',
      format: 'umd',
      name: 'ColorJSLogger',
      exports: 'default',
    },
    {
      file: 'dist/jslogger.min.js',
      format: 'umd',
      name: 'ColorJSLogger',
      exports: 'default',
      plugins: [terser()],
    },
    {
      file: 'dist/jslogger.esm.js',
      format: 'es',
    },
  ],
  plugins,
};
