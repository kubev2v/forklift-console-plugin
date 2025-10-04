import type { V1beta1Plan } from '@kubev2v/types';

export const getSkipGuestConversion = (resource: V1beta1Plan): boolean | undefined =>
  resource?.spec?.skipGuestConversion;

export const getUseCompatibilityMode = (resource: V1beta1Plan): boolean | undefined =>
  resource?.spec?.useCompatibilityMode;
