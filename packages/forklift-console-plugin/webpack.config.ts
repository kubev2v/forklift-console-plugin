/* eslint-disable @cspell/spellchecker */
/* eslint-env node */

import * as path from 'path';

import CopyWebpackPlugin from 'copy-webpack-plugin';
import svgToMiniDataURI from 'mini-svg-data-uri';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { Configuration as WebpackConfiguration, EnvironmentPlugin } from 'webpack';
import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';

import { DynamicConsoleRemotePlugin } from '@kubev2v/webpack';

import extensions from './plugin-extensions';
import pluginMetadata from './plugin-metadata';

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

export const ENVIRONMENT_DEFAULTS = {
  /**
   * Used for testing when no api servers are available.  If set to `mock`, network api
   * calls will use mock data.
   */
  DATA_SOURCE: 'remote' as 'mock' | 'remote',

  /**
   * UI branding name.
   *
   * Note: downstream builds are set to: 'RedHat'
   */
  BRAND_TYPE: 'Forklift' as 'RedHat' | 'Forklift',

  /**
   * Namespaces used by UI forms and modals if no namespace is given by the user.
   *
   * Note: downstream build are set to: 'openshift-mtv'
   */
  DEFAULT_NAMESPACE: 'konveyor-forklift',

  /**
   * Name of the console plugin.  It should be set to the plugin name used in the
   * installation scripts.  Defaults to the name in `package.json`: 'forklift-console-plugin'.
   */
  PLUGIN_NAME: pluginMetadata.name,

  /**
   * Version of the plugin.  Defaults to the version in `package.json`.
   */
  VERSION: pluginMetadata.version,
};

const config: Configuration = {
  mode: 'development',
  context: path.resolve(__dirname, 'src'),
  entry: {},
  output: {
    publicPath: `/api/plugins/${pluginMetadata.name}/`,
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]-bundle.js',
    chunkFilename: '[name]-chunk.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    plugins: [new TsconfigPathsPlugin({ baseUrl: '.' })],
  },
  module: {
    rules: [
      {
        test: /\.(jsx?|tsx?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.json'),
            },
          },
        ],
      },
      {
        test: /\.s?(css)$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.svg$/,
        type: 'asset/inline',
        generator: {
          dataUrl: (content) => {
            content = content.toString();
            return svgToMiniDataURI(content);
          },
        },
      },
      {
        test: /\.(png|jpg|jpeg|gif|woff2?|ttf|eot|otf)(\?.*$|$)/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name].[ext]',
        },
      },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  plugins: [
    new DynamicConsoleRemotePlugin({
      pluginMetadata,
      extensions,
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: '../locales', to: '../dist/locales' }],
    }),
    new EnvironmentPlugin(ENVIRONMENT_DEFAULTS),
  ],
  devtool: 'source-map',
  optimization: {
    chunkIds: 'named',
    minimize: false,
  },
  devServer: {
    static: ['./dist'],
    host: 'localhost',
    hot: false,
    port: 9001,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization',
      'Service-Worker-Allowed': '/', // needed to support MockServiceWorker
      'Cache-Control': 'no-store', // Jan-4-2024, workaround for a caching bug in bridge
    },
    devMiddleware: {
      writeToDisk: true,
    },
    client: {
      progress: true,
    },
  },
};

if (process.env.NODE_ENV === 'production') {
  config.mode = 'production';
  config.output.filename = '[name]-bundle-[hash].min.js';
  config.output.chunkFilename = '[name]-chunk-[chunkhash].min.js';
  config.optimization.chunkIds = 'deterministic';
  config.optimization.minimize = true;
}

export default config;
