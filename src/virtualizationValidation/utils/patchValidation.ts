import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { VirtualizationValidationModel } from '../models';
import type { VirtualizationValidation } from '../types';

const rerunID = (): string => `rerun-${Date.now().toString(36)}`;

export const cancelValidation = async (
  validation: VirtualizationValidation,
): Promise<VirtualizationValidation> =>
  k8sPatch({
    data: [{ op: 'replace', path: '/spec/run/cancel', value: true }],
    model: VirtualizationValidationModel,
    resource: validation,
  });

export const rerunValidation = async (
  validation: VirtualizationValidation,
): Promise<VirtualizationValidation> =>
  k8sPatch({
    data: [
      { op: 'replace', path: '/spec/run/cancel', value: false },
      { op: 'replace', path: '/spec/run/id', value: rerunID() },
    ],
    model: VirtualizationValidationModel,
    resource: validation,
  });
