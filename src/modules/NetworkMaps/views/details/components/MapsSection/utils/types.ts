import type { NetworkMapping } from 'src/networkMaps/constants';

import type { V1beta1NetworkMap, V1beta1Provider } from '@kubev2v/types';

export type NetworkEditFormValues = {
  networkMap: NetworkMapping[];
};

export type NetworkMapEditProps = {
  namespace: string;
  sourceProvider: V1beta1Provider;
  destinationProvider: V1beta1Provider;
  networkMap: V1beta1NetworkMap;
  initialMappings: NetworkMapping[];
};
