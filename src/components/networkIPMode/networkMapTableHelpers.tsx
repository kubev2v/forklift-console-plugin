import type { ReactElement } from 'react';

import { getNetworkMapFieldId } from 'src/networkMaps/utils/getNetworkMapFieldId';
import { NetworkMapFieldId } from '@utils/crds/maps/types';

import NetworkIPModeRow from './NetworkIPModeRow';

export const getNetworkIPModeRow = (index: number, isDisabled?: boolean): ReactElement => (
  <NetworkIPModeRow
    index={index}
    isDisabled={isDisabled}
    targetNetworkFieldId={getNetworkMapFieldId(NetworkMapFieldId.TargetNetwork, index)}
  />
);
