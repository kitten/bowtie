import resolve from '@rollup/plugin-node-resolve';
import buble from '@rollup/plugin-buble';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import compiler from '@ampproject/rollup-plugin-closure-compiler';

const plugins = [
  resolve({
    mainFields: ['module', 'jsnext', 'main'],
    extensions: ['.mjs', '.js', '.ts', '.tsx'],
    browser: true,
  }),
  babel({
    babelrc: true
  }),
  buble({
    transforms: {
      unicodeRegExp: false,
      dangerousForOf: true,
      dangerousTaggedTemplateString: true,
    },
    objectAssign: 'Object.assign',
    exclude: 'node_modules/**',
  }),
  babel({
    babelrc: false,
    exclude: 'node_modules/**',
    presets: [],
    plugins: [
      '@babel/plugin-transform-object-assign',
    ],
  }),
  compiler({
    formatting: 'PRETTY_PRINT',
    compilation_level: 'SIMPLE_OPTIMIZATIONS',
  }),
  terser({
    ie8: false,
    toplevel: true,
    compress: true,
  }),
];

const output = (format = 'cjs', ext = '.js', isProd) => ({
  chunkFileNames: '[hash]' + ext,
  entryFileNames: 'bowtie-[name]' + ext,
  dir: './dist',
  exports: 'named',
  externalLiveBindings: false,
  sourcemap: false,
  esModule: false,
  indent: false,
  freeze: false,
  strict: false,
  format,
});

export default {
  input: {
    core: './src/index.mjs'
  },
  onwarn: () => {},
  external: () => false,
  treeshake: {
    propertyReadSideEffects: false,
  },
  plugins,
  output: [
    output('cjs', '.js'),
    output('esm', '.mjs'),
    output('cjs', '.js', true),
    output('esm', '.mjs', true)
  ],
};

