import { TRUE_VALUE } from 'src/providers/utils/constants';

import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { ProviderModel, type V1beta1Provider } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { getApplianceManagement } from '@utils/crds/common/selectors';

const onUpdateApplianceManagement = async (
  provider: V1beta1Provider,
  enabled: boolean,
): Promise<V1beta1Provider> => {
  const currentValue = getApplianceManagement(provider);

  if (currentValue === enabled.toString()) return provider;

  const obj = await k8sPatch({
    data: [
      {
        op: currentValue ? REPLACE : ADD,
        path: '/spec/settings/applianceManagement',
        value: enabled ? TRUE_VALUE : undefined,
      },
    ],
    model: ProviderModel,
    resource: provider,
  });

  return obj;
};

export default onUpdateApplianceManagement;
