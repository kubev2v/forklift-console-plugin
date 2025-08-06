import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { getSkipGuestConversion, getUseCompatibilityMode } from './utils';

enum PlanSpecPaths {
  SkipGuestConversion = '/spec/skipGuestConversion',
  UseCompatibilityMode = '/spec/useCompatibilityMode',
}

type GuestConversionPatchParams = {
  resource: V1beta1Plan;
  newValue: boolean;
  useCompatibilityMode?: boolean;
};

/**
 * Patches a Plan resource to update guest conversion settings.
 * Sets skipGuestConversion and conditionally manages useCompatibilityMode.
 */
export const patchGuestConversion = async ({
  newValue,
  resource,
  useCompatibilityMode,
}: GuestConversionPatchParams): Promise<V1beta1Plan> => {
  const currentSkipGuestConversion = getSkipGuestConversion(resource);
  const currentUseCompatibilityMode = getUseCompatibilityMode(resource);

  const patches = [];

  patches.push({
    op: currentSkipGuestConversion === undefined ? ADD : REPLACE,
    path: PlanSpecPaths.SkipGuestConversion,
    value: newValue,
  });

  if (newValue && useCompatibilityMode !== undefined) {
    patches.push({
      op: currentUseCompatibilityMode === undefined ? ADD : REPLACE,
      path: PlanSpecPaths.UseCompatibilityMode,
      value: useCompatibilityMode,
    });
  } else if (!newValue && currentUseCompatibilityMode !== undefined) {
    patches.push({
      op: 'remove',
      path: PlanSpecPaths.UseCompatibilityMode,
    });
  }

  return k8sPatch({
    data: patches,
    model: PlanModel,
    resource,
  });
};
