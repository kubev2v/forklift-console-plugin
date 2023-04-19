import { setupWorker } from 'msw';

import { createDefaultHandlers } from './cluster-proxy-server/handlers';

export const worker = setupWorker(...createDefaultHandlers({}));
