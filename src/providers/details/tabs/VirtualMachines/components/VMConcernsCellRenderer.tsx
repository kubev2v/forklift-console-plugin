import type { FC } from 'react';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableEmptyCell } from 'src/components/TableCell/TableEmptyCell';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import ConcernPopover from '@components/Concerns/components/ConcernsPopover';
import { groupConcernsByCategory } from '@components/Concerns/utils/category';
import type { ConcernCategory } from '@components/Concerns/utils/constants';
import type { Concern } from '@kubev2v/types';
import { Split, SplitItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import { orderedConcernCategories } from '../constants';

import type { VMCellProps } from './VMCellProps';
/**
 * Renders a table cell containing concerns grouped by category.
 *
 * @param {VMCellProps} props - The properties of the VMConcernsCellRenderer component.
 * @returns {ReactElement} The rendered table cell.
 */
export const VMConcernsCellRenderer: FC<VMCellProps> = ({ data }) => {
  const concerns: Concern[] =
    data?.vm?.providerType === PROVIDER_TYPES.openshift ? [] : data?.vm?.concerns;
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
                <ConcernPopover
                  category={category}
                  concerns={groupedConcerns[category as ConcernCategory] || []}
                  conditions={[]}
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
