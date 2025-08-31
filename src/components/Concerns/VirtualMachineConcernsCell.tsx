import type { FC } from 'react';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';
import { TableEmptyCell } from 'src/modules/Providers/utils/components/TableCell/TableEmptyCell';
import type { VmData } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/VMCellProps';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { Concern } from '@kubev2v/types';
import { Split, SplitItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import ConcernPopover from './components/ConcernsPopover';
import { groupConcernsByCategory } from './utils/category';
import { orderedConcernCategories } from './utils/constants';

const VirtualMachineConcernsCell: FC<{ vmData: VmData }> = ({ vmData }) => {
  const concerns: Concern[] =
    vmData?.vm?.providerType === PROVIDER_TYPES.openshift ? [] : vmData?.vm?.concerns;
  if (!concerns || isEmpty(concerns)) {
    return <TableEmptyCell />;
  }

  const groupedConcerns = groupConcernsByCategory(concerns);

  return (
    <TableCell>
      <Split hasGutter>
        {orderedConcernCategories.map((category) => {
          const hasConcernCategory = concerns?.find((concern) => concern.category === category);

          if (hasConcernCategory) {
            return (
              <SplitItem key={category}>
                <ConcernPopover category={category} concerns={groupedConcerns[category] || []} />
              </SplitItem>
            );
          }

          return null;
        })}
      </Split>
    </TableCell>
  );
};

export default VirtualMachineConcernsCell;
