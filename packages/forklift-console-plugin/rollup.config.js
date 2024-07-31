/* eslint-env node */
import css from 'rollup-plugin-import-css';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import url from '@rollup/plugin-url';

import pkg from './package.json';

const getExternalModules = ({ dependencies, peerDependencies }) =>
  Array.from(new Set([...Object.keys(dependencies ?? {}), ...Object.keys(peerDependencies ?? {})]));

const externalModules = getExternalModules(pkg);

export default {
  input: './src/index.ts',
  output: {
    file: 'distlib/index.js',
    format: 'esm',
    sourcemap: true,
  },
  external: externalModules.map((m) => new RegExp(`^${m}(\\/.+)*$`)),
  plugins: [
    url({
      include: ['**/*.svg'],
      limit: 0,
      fileName: '[name][hash][extname]',
    }),
    commonjs(),
    json({
      compact: true,
      preferConst: true,
    }),
    css({
      output: 'index.css',
    }),
    typescript({
      tsconfig: './tsconfig.json',
      jsx: 'react',
    }),
  ],
};
