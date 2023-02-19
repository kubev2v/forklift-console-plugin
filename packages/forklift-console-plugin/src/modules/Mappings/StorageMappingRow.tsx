import React from 'react';
import { RowProps } from 'common/src/components/TableView';
import { MappingType } from 'legacy/src/queries/types';
import * as C from 'src/utils/constants';

import { Label } from '@patternfly/react-core';
import { StorageDomainIcon } from '@patternfly/react-icons';

import MappingRow, { CellCreator, CellProps, commonCells, SourceCell } from './CommonRow';
import { FlatStorageMapping } from './dataForStorage';
import { StorageMappingActions } from './mappingActions';

import './styles.css';

const SourceStorageCell = ({ entity }: CellProps<FlatStorageMapping>) => {
  return (
    <SourceCell
      Icon={StorageDomainIcon}
      groups={entity.from}
      itemsInFirstGroup={entity.from?.[0]?.[1]}
    />
  );
};

const TargetStorageCell = ({ entity }: CellProps<FlatStorageMapping>) => (
  <span className="forklift-table__flex-labels-with-gaps">
    {entity.to.map(({ name }) => (
      <Label key={name} color="blue">
        {name}
      </Label>
    ))}
  </span>
);

const storageCells: CellCreator<FlatStorageMapping> = {
  [C.FROM]: SourceStorageCell,
  [C.TO]: TargetStorageCell,
  [C.ACTIONS]: ({ entity }: CellProps<FlatStorageMapping>) => (
    <StorageMappingActions entity={entity} />
  ),
};

const StorageMappingRow = (props: RowProps<FlatStorageMapping>) => (
  <MappingRow
    rowProps={props}
    cellCreator={{ ...commonCells, ...storageCells }}
    mappingType={MappingType.Storage}
    mapping={props.entity.object}
  />
);

export default StorageMappingRow;
