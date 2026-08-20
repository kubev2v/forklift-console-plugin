import { ServerBranding } from './constants';

/**
 * Determines whether user is upstream based on SERVER_FLAGS branding
 * @returns boolean
 */
export const isUpstream = (): boolean =>
  (window.SERVER_FLAGS?.branding ?? '') === (ServerBranding.Okd as string);
