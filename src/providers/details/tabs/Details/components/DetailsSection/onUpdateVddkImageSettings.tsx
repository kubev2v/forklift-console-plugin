import { ProviderFormFieldId } from 'src/providers/create/fields/constants';
import { TRUE_VALUE, VddkSetupMode } from 'src/providers/utils/constants';

import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { ProviderModel, type V1beta1Provider } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { getUseVddkAioOptimization, getVddkInitImage } from '@utils/crds/common/selectors';

import type { EditProviderVDDKImageFormData } from './utils/types';

const onUpdateVddkImageSettings = async (
  provider: V1beta1Provider,
  formData: EditProviderVDDKImageFormData,
): Promise<V1beta1Provider> => {
  const vddkInitImage = formData[ProviderFormFieldId.VsphereVddkInitImage];
  const useVddkAioOptimization = formData[ProviderFormFieldId.VsphereUseVddkAioOptimization];
  const vddkSetupMode = formData[ProviderFormFieldId.VsphereVddkSetupMode];
  const shouldSkipVddk = vddkSetupMode === VddkSetupMode.Skip;

  const obj = await k8sPatch({
    data: [
      {
        op: getVddkInitImage(provider) ? REPLACE : ADD,
        path: '/spec/settings/vddkInitImage',
        value: shouldSkipVddk ? undefined : vddkInitImage?.trim(),
      },
      {
        op: getUseVddkAioOptimization(provider) ? REPLACE : ADD,
        path: '/spec/settings/useVddkAioOptimization',
        value: shouldSkipVddk || !useVddkAioOptimization ? undefined : TRUE_VALUE,
      },
    ],
    model: ProviderModel,
    resource: provider,
  });

  return obj;
};

export default onUpdateVddkImageSettings;
