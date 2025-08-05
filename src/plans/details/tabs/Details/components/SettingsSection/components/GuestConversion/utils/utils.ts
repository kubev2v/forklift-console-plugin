import type { V1beta1Plan } from '@kubev2v/types';

import type { EnhancedPlan } from '../../../utils/types';

export const getSkipGuestConversion = (resource: V1beta1Plan): boolean | undefined =>
  (resource as EnhancedPlan)?.spec?.skipGuestConversion;

export const getUseCompatibilityMode = (resource: V1beta1Plan): boolean | undefined =>
  (resource as EnhancedPlan)?.spec?.useCompatibilityMode;
