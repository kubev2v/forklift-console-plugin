import { setupWorker } from 'msw';

import { createDefaultHandlers } from './handlers';

export const worker = setupWorker(...createDefaultHandlers({}));
