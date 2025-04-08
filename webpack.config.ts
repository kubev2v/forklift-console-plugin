/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @cspell/spellchecker */

import * as path from 'path';

import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import svgToMiniDataURI from 'mini-svg-data-uri';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { type Configuration as WebpackConfiguration, EnvironmentPlugin } from 'webpack';
import type { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';

import { ConsoleRemotePlugin } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { ENVIRONMENT_DEFAULTS } from './environment-defaults';
import extensions from './plugin-extensions';
import pluginMetadata from './plugin-metadata';

const CopyPlugin = require('copy-webpack-plugin');
type Configuration = {
  devServer?: WebpackDevServerConfiguration;
} & WebpackConfiguration;

const config: Configuration = {
  context: path.resolve(__dirname, 'src'),
  devServer: {
    allowedHosts: 'all',
    client: {
      progress: true,
    },
    devMiddleware: {
      writeToDisk: true,
    },
    headers: {
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store', // Jan-4-2024, workaround for a caching bug in bridge
      'Service-Worker-Allowed': '/', // Needed to support MockServiceWorker
    },
    hot: true,
    port: 9001,
    static: ['./dist'],
  },
  devtool: 'source-map',
  entry: {},
  mode: 'development',
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.(jsx?|tsx?)$/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
      {
        test: /\.s?(css)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        generator: {
          dataUrl: (content: string) => {
            content = content.toString();
            return svgToMiniDataURI(content);
          },
        },
        test: /\.svg$/,
        type: 'asset/inline',
      },
      {
        generator: {
          filename: 'assets/[name].[ext]',
        },
        test: /\.(png|jpg|jpeg|gif|woff2?|ttf|eot|otf)(\?.*$|$)/,
        type: 'asset/resource',
      },
      {
        resolve: {
          fullySpecified: false,
        },
        test: /\.m?js/,
      },
    ],
  },
  optimization: {
    chunkIds: 'named',
    minimize: false,
  },
  output: {
    chunkFilename: '[name]-chunk.js',
    filename: '[name]-bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: `/api/plugins/${pluginMetadata.name}/`,
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.resolve(__dirname, 'tsconfig.json'),
        diagnosticOptions: {
          semantic: false,
          syntactic: false,
        },
      },
    }),
    new ConsoleRemotePlugin({
      extensions,
      pluginMetadata,
    }),
    new CopyPlugin({
      patterns: [{ from: '../locales', to: '../dist/locales' }],
    }),
    new EnvironmentPlugin(ENVIRONMENT_DEFAULTS),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    plugins: [new TsconfigPathsPlugin({ baseUrl: '.' })],
  },
};

if (process.env.NODE_ENV === 'production') {
  config.mode = 'production';

  // Ensure `output` is initialized if undefined
  config.output = config.output || {};
  config.output.filename = '[name]-bundle-[hash].min.js';
  config.output.chunkFilename = '[name]-chunk-[chunkhash].min.js';

  // Ensure `optimization` is initialized if undefined
  config.optimization = config.optimization || {};
  config.optimization.chunkIds = 'deterministic';
  config.optimization.minimize = true;
}
export default config;
