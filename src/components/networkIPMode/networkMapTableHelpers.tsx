import type { ReactElement } from 'react';

import { NetworkMapFieldId } from '@utils/crds/maps/types';
import { getMapFieldId } from '@utils/mapForms/getMapFieldId';

import NetworkIPModeRow from './NetworkIPModeRow';

export const getNetworkIPModeRow = (index: number, isDisabled?: boolean): ReactElement => (
  <NetworkIPModeRow
    index={index}
    isDisabled={isDisabled}
    targetNetworkFieldId={getMapFieldId(
      NetworkMapFieldId.NetworkMap,
      NetworkMapFieldId.TargetNetwork,
      index,
    )}
  />
);
