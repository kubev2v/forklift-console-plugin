/* eslint-env node */

import { type Configuration as WebpackConfiguration } from 'webpack';
import { type Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';
import { merge } from 'webpack-merge';

import baseConfig from './webpack.config';

/**
 * Run the forklift plugin as an overlay on top of an existing Console UI.
 * The requirement is that the plugin is already installed in the Console.
 * Key points:
 * 1. Console UI is accessed via webpack dev server proxy with all the paths unchanged
 * 2. local plugin is served via public path (see base config) which is the same as the URL used by the Console
 * 3. when the Console loads the plugin(by URL) the local version is used
 */
const config: WebpackConfiguration & {
  devServer: WebpackDevServerConfiguration;
} = {
  devServer: {
    port: 9000,
    // hot reload doesn't work with the Console (the plugin needs to be re-loaded)
    hot: false,
    webSocketServer: {
      options: {
        //prevents conflicts with web sockets from the app
        port: 9001,
        // just to differentiate WebPack sockets
        path: '/webpackWebSockets',
      },
    },
    proxy: [
      {
        // proxy also the root URL ('/')
        context: () => true,
        target: process.env.CONSOLE_URL || 'http://localhost:30080/',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    ],
  },
};

export default merge(baseConfig, config);
