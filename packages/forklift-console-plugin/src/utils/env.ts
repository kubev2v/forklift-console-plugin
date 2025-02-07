import { ServerBranding } from './constants';

/**
 * Determines whether user is upstream based on SERVER_FLAGS branding
 * @returns boolean
 */
export const isUpstream = () => window.SERVER_FLAGS?.branding === ServerBranding.Okd;
