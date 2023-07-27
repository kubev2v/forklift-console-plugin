/* eslint-env node */

/**
 * Source: https://github.com/openshift/dynamic-plugin-sdk/blob/main/packages/common/rollup-configs.js
 *
 * Default rollup settings from @openshift/dynamic-plugin-sdk
 */

import css from 'rollup-plugin-import-css';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';

import har from './rollup/plugin-har';
import writeJSONFile from './rollup/plugin-write-json-file';
import { createBannerComment, getBuildMetadata } from './metadata';

/**
 * @param {import('type-fest').PackageJson} pkg
 * @returns {Record<string, string>} external modules as dictionary.
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
        jsx: 'react',
      }),
      writeJSONFile({
        fileName: 'build-metadata.json',
        value: buildMetadata,
      }),
    ],
  };
};
