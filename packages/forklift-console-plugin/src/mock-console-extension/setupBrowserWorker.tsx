import { type SetupWorker, rest, setupWorker } from 'msw';

import { allHandlers } from '@kubev2v/mocks/consoleHandlers';

export { type SetupWorker } from 'msw';

/**
 * Setup the MockServiceWorker with all of the mock handlers available handling request
 * for UI url paths.  The worker will be added to `window.msw` for debugging convenience.
 *
 * @param staticFilePath URL prefix where `mockServiceWorker.js` will be available
 * @returns A setup and started MockServiceWorker
 */
export function setupBrowserWorker(staticFilePath: string): SetupWorker {
  const worker = setupWorker(
    ...allHandlers,

    rest.all('/*', (req) => {
      console.log(
        '%cmock-plugin passthrough%c \u{1fa83} %s',
        'font-weight: bold',
        'font-weight: normal',
        req.url,
      );
      return req.passthrough();
    }),
  );

  worker.start({
    serviceWorker: {
      url: `${staticFilePath}${staticFilePath.endsWith('/') ? '' : '/'}mockServiceWorker.js`,
      options: {
        scope: '/',
      },
    },
  });

  worker.printHandlers();

  window['msw'] = worker;

  return worker;
}
