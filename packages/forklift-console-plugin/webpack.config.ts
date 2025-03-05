/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @cspell/spellchecker */
/* eslint-env node */

import * as path from 'path';

import svgToMiniDataURI from 'mini-svg-data-uri';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { Configuration as WebpackConfiguration, EnvironmentPlugin } from 'webpack';
import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';

import { ConsoleRemotePlugin } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { ENVIRONMENT_DEFAULTS } from './environment-defaults';
import extensions from './plugin-extensions';
import pluginMetadata from './plugin-metadata';

const CopyPlugin = require('copy-webpack-plugin');
interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

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
    new ConsoleRemotePlugin({
      pluginMetadata,
      extensions,
    }),
    new CopyPlugin({
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
    allowedHosts: 'all',
    hot: true,
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
