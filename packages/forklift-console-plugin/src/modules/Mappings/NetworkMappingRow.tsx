import React from 'react';
import { RowProps } from 'common/src/components/TableView';
import { MappingType } from 'legacy/src/queries/types';
import * as C from 'src/utils/constants';

import { Label } from '@patternfly/react-core';
import { NetworkIcon } from '@patternfly/react-icons';

import MappingRow, { CellCreator, CellProps, commonCells, SourceCell } from './CommonRow';
import { FlatNetworkMapping, Network } from './dataForNetwork';
import { NetworkMappingActions } from './mappingActions';

const SourceNetworksCell = ({ entity }: CellProps<FlatNetworkMapping>) => {
  return (
    <SourceCell Icon={NetworkIcon} groups={entity.from} itemsInFirstGroup={entity.from?.[0]?.[1]} />
  );
};

const networkName = (n: Network, t: (k: string) => string) =>
  n.type === 'pod' ? t('Pod network') : `${n.namespace}/${n.name}`;

const TargetNetworksCell = ({ t, entity }: CellProps<FlatNetworkMapping>) => (
  <>
    {entity.to.map((n) => {
      return (
        <>
          <Label key={networkName(n, t)} color="blue">
            {networkName(n, t)}
          </Label>{' '}
        </>
      );
    })}
  </>
);

const networkCells: CellCreator<FlatNetworkMapping> = {
  [C.ACTIONS]: ({ entity }: CellProps<FlatNetworkMapping>) => (
    <NetworkMappingActions entity={entity} />
  ),
  [C.FROM]: SourceNetworksCell,
  [C.TO]: TargetNetworksCell,
};

const NetworkMappingRow = (props: RowProps<FlatNetworkMapping>) => (
  <MappingRow
    rowProps={props}
    cellCreator={{ ...commonCells, ...networkCells }}
    mappingType={MappingType.Network}
    mapping={props.entity.object}
  />
);

export default NetworkMappingRow;
