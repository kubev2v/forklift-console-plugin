import { ServerBranding } from './constants';

/**
 * Determines whether user is upstream based on SERVER_FLAGS branding
 * @returns boolean
 */
export const isUpstream = () =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (window.SERVER_FLAGS?.branding ?? '') === String(ServerBranding.Okd);
