import type { V1beta1NetworkMap, V1beta1Provider } from '@forklift-ui/types';
import type { NetworkMapping } from '@utils/crds/maps/types';

export type NetworkEditFormValues = {
  networkMap: NetworkMapping[];
};

export type NetworkMapEditProps = {
  destinationProvider?: V1beta1Provider;
  initialMappings: NetworkMapping[];
  networkMap: V1beta1NetworkMap;
  sourceProvider?: V1beta1Provider;
};
