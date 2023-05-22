/* eslint-disable no-undef */
/**
 * Source: https://github.com/openshift/dynamic-plugin-sdk/blob/main/packages/common/rollup-configs.js
 *
 * Default rollup settings from @openshift/dynamic-plugin-sdk
 */

import analyzer from 'rollup-plugin-analyzer';
import css from 'rollup-plugin-import-css';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

import { createBannerComment, getBuildMetadata } from '../packages/build/src/metadata';

import har from './rollup/plugin-har';
import writeJSONFile from './rollup/plugin-write-json-file';

// https://yarnpkg.com/advanced/lifecycle-scripts#environment-variables
const rootDir = process.env.PROJECT_CWD;

/**
 * @param {import('type-fest').PackageJson} pkg
 */
export const getExternalModules = ({ dependencies, peerDependencies }) =>
  Array.from(new Set([...Object.keys(dependencies ?? {}), ...Object.keys(peerDependencies ?? {})]));

/**
 * Rollup configuration for generating the library `.js` bundle.
 *
 * @param {import('type-fest').PackageJson} pkg
 * @param {string} inputFile
 * @param {'esm' | 'cjs'} format
 * @returns {import('rollup').RollupOptions}
 */
export const tsLibConfig = (pkg, inputFile, format = 'esm') => {
  const buildMetadata = getBuildMetadata(pkg);
  const externalModules = getExternalModules(pkg);

  return {
    input: inputFile,
    output: {
      file: 'dist/index.js',
      format,
      banner: createBannerComment(pkg, buildMetadata),
      sourcemap: true,
    },
    external: externalModules.map((m) => new RegExp(`^${m}(\\/.+)*$`)),
    plugins: [
      nodeResolve(),
      commonjs(),
      json({
        compact: true,
        preferConst: true,
      }),
      har({
        compact: true,
        preferConst: true,
      }),
      css({
        output: 'dist/index.css',
      }),
      typescript({
        tsconfig: './tsconfig.json',
        noEmitOnError: true,
        jsx: 'react',
      }),
      writeJSONFile({
        fileName: 'build-metadata.json',
        value: buildMetadata,
      }),
      analyzer({
        summaryOnly: true,
        root: rootDir,
      }),
    ],
  };
};
