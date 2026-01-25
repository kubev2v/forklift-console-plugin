import { buildNetworkMappings } from 'src/networkMaps/create/utils/buildNetworkMappings';

import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { NetworkMapModel, type V1beta1NetworkMap, type V1beta1Provider } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { isEmpty } from '@utils/helpers';

import type { PlanNetworkEditFormValues } from './types';

export const patchNetworkMappingValues = async (
  formData: PlanNetworkEditFormValues,
  networkMap: V1beta1NetworkMap,
  sourceProvider: V1beta1Provider,
) => {
  const op = isEmpty(networkMap?.spec?.map) ? ADD : REPLACE;

  await k8sPatch({
    data: [
      {
        op,
        path: '/spec/map',
        value: buildNetworkMappings(formData.networkMap, sourceProvider),
      },
    ],
    model: NetworkMapModel,
    resource: networkMap,
  });
};
