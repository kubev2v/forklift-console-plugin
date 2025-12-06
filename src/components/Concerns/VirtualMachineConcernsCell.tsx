import type { FC } from 'react';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';
import { TableEmptyCell } from 'src/modules/Providers/utils/components/TableCell/TableEmptyCell';
import type { VmData } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/VMCellProps';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { Concern, V1beta1PlanStatusConditions } from '@kubev2v/types';
import { Split, SplitItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import ConcernPopover from './components/ConcernsPopover';
import {
  getCategoryLabel,
  groupConcernsByCategory,
  groupConditionsByCategory,
} from './utils/category';
import { orderedConcernCategories } from './utils/constants';

type VirtualMachineConcernsCellProps = {
  vmData: VmData;
  conditions?: V1beta1PlanStatusConditions[];
};

const VirtualMachineConcernsCell: FC<VirtualMachineConcernsCellProps> = ({
  conditions,
  vmData,
}) => {
  const concerns: Concern[] =
    vmData?.vm?.providerType === PROVIDER_TYPES.openshift ? [] : vmData?.vm?.concerns;
  if (isEmpty(concerns) && isEmpty(conditions)) {
    return <TableEmptyCell />;
  }

  const groupedConcerns = groupConcernsByCategory(concerns);
  const groupedConditions = groupConditionsByCategory(conditions);

  return (
    <TableCell>
      <Split hasGutter>
        {orderedConcernCategories.map((category) => {
          const hasConcernCategory = concerns?.find((concern) => concern.category === category);
          const hasConditionCategory = conditions?.find(
            (condition) => getCategoryLabel(condition.category) === category,
          );

          if (hasConcernCategory || hasConditionCategory) {
            return (
              <SplitItem key={category}>
                <ConcernPopover
                  category={category}
                  concerns={groupedConcerns[category] || []}
                  conditions={groupedConditions[category] || []}
                />
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
