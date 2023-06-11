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
import { StorageDomainIcon } from '@patternfly/react-icons';

import { FlatStorageMapping } from './dataForStorage';
import { StorageMappingActions } from './mappingActions';

import './styles.css';

const SourceStorageCell = ({ resourceData }: CellProps<FlatStorageMapping>) => {
  return (
    <SourceCell
      Icon={StorageDomainIcon}
      groups={resourceData.from}
      itemsInFirstGroup={resourceData.from?.[0]?.[1]}
    />
  );
};

const TargetStorageCell = ({ resourceData }: CellProps<FlatStorageMapping>) => (
  <span className="forklift-table__flex-labels-with-gaps">
    {resourceData.to.map(({ name }) => (
      <Label key={name} color="blue">
        {name}
      </Label>
    ))}
  </span>
);

const storageCells: CellCreator<FlatStorageMapping> = {
  [C.FROM]: SourceStorageCell,
  [C.TO]: TargetStorageCell,
  [C.ACTIONS]: ({ resourceData: resourceData }: CellProps<FlatStorageMapping>) => (
    <StorageMappingActions resourceData={resourceData} />
  ),
};

const StorageMappingRow = (props: RowProps<FlatStorageMapping>) => (
  <MappingRow
    rowProps={props}
    cellCreator={{ ...commonCells, ...storageCells }}
    mappingType={MappingType.Storage}
    mapping={props.resourceData.object}
  />
);

export default StorageMappingRow;
