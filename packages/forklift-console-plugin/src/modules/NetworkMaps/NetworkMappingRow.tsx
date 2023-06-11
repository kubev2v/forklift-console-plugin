import React from 'react';
import MappingRow, {
  CellCreator,
  CellProps,
  commonCells,
  SourceCell,
} from 'src/components/mappings/MappingRow';
import * as C from 'src/utils/constants';

import { RowProps } from '@kubev2v/common';
import { MappingType } from '@kubev2v/legacy/queries/types';
import { Label } from '@patternfly/react-core';
import { NetworkIcon } from '@patternfly/react-icons';

import { FlatNetworkMapping, Network } from './dataForNetwork';
import { NetworkMappingActions } from './mappingActions';

import './styles.css';

const SourceNetworksCell = ({ resourceData }: CellProps<FlatNetworkMapping>) => {
  return (
    <SourceCell
      Icon={NetworkIcon}
      groups={resourceData.from}
      itemsInFirstGroup={resourceData.from?.[0]?.[1]}
    />
  );
};

const networkName = (n: Network, t: (k: string) => string) =>
  n.type === 'pod' ? t('Pod network') : `${n.namespace}/${n.name}`;

const TargetNetworksCell = ({ t, resourceData }: CellProps<FlatNetworkMapping>) => (
  <span className="forklift-table__flex-labels-with-gaps">
    {resourceData.to.map((n) => {
      return (
        <Label key={networkName(n, t)} color="blue">
          {networkName(n, t)}
        </Label>
      );
    })}
  </span>
);

const networkCells: CellCreator<FlatNetworkMapping> = {
  [C.ACTIONS]: ({ resourceData }: CellProps<FlatNetworkMapping>) => (
    <NetworkMappingActions resourceData={resourceData} />
  ),
  [C.FROM]: SourceNetworksCell,
  [C.TO]: TargetNetworksCell,
};

const NetworkMappingRow = (props: RowProps<FlatNetworkMapping>) => (
  <MappingRow
    rowProps={props}
    cellCreator={{ ...commonCells, ...networkCells }}
    mappingType={MappingType.Network}
    mapping={props.resourceData.object}
  />
);

export default NetworkMappingRow;
