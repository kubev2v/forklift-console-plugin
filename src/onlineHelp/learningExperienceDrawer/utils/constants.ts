import { PROVIDER_TYPES } from 'src/providers/utils/constants';

export const DEFAULT_DRAWER_WIDTH = '400px';
export const STORAGE_KEY = `${process.env.PLUGIN_NAME}/learningExperience`;
export const DEFAULT_DATA = {
  providerType: PROVIDER_TYPES.vsphere,
};
