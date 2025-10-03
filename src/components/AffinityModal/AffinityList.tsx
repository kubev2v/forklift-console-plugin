import type { FC } from 'react';

import { VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';
import { Stack, StackItem } from '@patternfly/react-core';

import { affinityColumns } from './utils/constants';
import type { AffinityRowData } from './utils/types';
import AddAffinityRuleButton from './AddAffinityRuleButton';
import AffinityDescriptionText from './AffinityDescriptionText';
import AffinityRow from './AffinityRow';

type AffinityListProps = {
  affinities: AffinityRowData[];
  onAffinityClickAdd: () => void;
  onDelete: (affinity: AffinityRowData) => void;
  onEdit: (affinity: AffinityRowData) => void;
};

const AffinityList: FC<AffinityListProps> = ({
  affinities,
  onAffinityClickAdd,
  onDelete,
  onEdit,
}) => {
  const columns = affinityColumns();
  return (
    <Stack hasGutter>
      <StackItem>
        <AffinityDescriptionText />
      </StackItem>
      <StackItem data-testid="affinity-rules-list">
        <VirtualizedTable<AffinityRowData>
          columns={columns}
          data={affinities ?? []}
          loaded
          loadError={false}
          Row={AffinityRow}
          rowData={{ onDelete, onEdit }}
          unfilteredData={affinities || []}
        />
      </StackItem>
      <StackItem>
        <AddAffinityRuleButton isLinkButton onAffinityClickAdd={onAffinityClickAdd} />
      </StackItem>
    </Stack>
  );
};
export default AffinityList;
