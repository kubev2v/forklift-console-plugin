import { type RestHandler } from 'msw';

import { handlers as providersHandlers } from './providers';

/**
 * All of the mock REST providers defined and available for use.
 */
export const allHandlers: RestHandler[] = [...providersHandlers];
