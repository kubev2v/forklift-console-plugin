import { TRUE_VALUE, YES_VALUE } from 'src/providers/create/utils/constants';
import { EMPTY_VDDK_INIT_IMAGE_ANNOTATION } from 'src/providers/utils/constants';

import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import type { K8sResourceCommon, V1beta1Provider } from '@kubev2v/types';
import { type K8sModel, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { getAnnotations, getSettings } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

const onUpdateVddkImageSettings = async (
  model: K8sModel,
  resource: K8sResourceCommon,
  {
    isEmptyImage,
    isUseVddkAio,
    newValue,
  }: { isEmptyImage: boolean; isUseVddkAio: boolean; newValue: string },
): Promise<K8sResourceCommon> => {
  const provider = resource as V1beta1Provider;
  const vddkInitImage: string = newValue;

  // Patch settings
  const currentSettings = (getSettings(provider) ?? {}) as object;
  const op1 = Object.keys(currentSettings).length ? REPLACE : ADD;
  const settings = {
    ...currentSettings,
    useVddkAioOptimization: isEmptyImage || !isUseVddkAio ? undefined : TRUE_VALUE,
    vddkInitImage: isEmptyImage ? undefined : vddkInitImage?.trim() || undefined,
  };

  await k8sPatch({
    data: [
      {
        op: op1,
        path: '/spec/settings',
        value: isEmpty(Object.keys(settings)) ? undefined : settings,
      },
    ],
    model,
    resource,
  });

  // Patch annotations
  const currentAnnotations = (getAnnotations(provider) ?? {}) as object;
  const op2 = Object.keys(currentAnnotations).length ? REPLACE : ADD;
  const annotations = {
    ...currentAnnotations,
    [EMPTY_VDDK_INIT_IMAGE_ANNOTATION]: isEmptyImage ? YES_VALUE : undefined,
  };

  const obj = await k8sPatch({
    data: [
      {
        op: op2,
        path: '/metadata/annotations',
        value: isEmpty(Object.keys(annotations)) ? undefined : annotations,
      },
    ],
    model,
    resource,
  });

  return obj;
};

export default onUpdateVddkImageSettings;
