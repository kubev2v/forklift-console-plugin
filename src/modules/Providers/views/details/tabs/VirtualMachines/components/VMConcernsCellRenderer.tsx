import type { FC } from 'react';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';
import { TableEmptyCell } from 'src/modules/Providers/utils/components/TableCell/TableEmptyCell';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  getCategoryIcon,
  getCategoryStatus,
  getCategoryTitle,
} from '@components/Concerns/utils/category';
import type { Concern } from '@kubev2v/types';
import {
  Button,
  ButtonVariant,
  Label,
  Popover,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import { orderedConcernCategories } from '../constants';
import { groupConcernsByCategory } from '../utils/helpers/groupConcernsByCategory';

import type { VMCellProps } from './VMCellProps';

/**
 * Renders a list of concerns.
 *
 * @param {Object} props - The properties of the ConcernList component.
 * @param {Concern[]} props.concerns - The list of concerns to render.
 * @returns {ReactElement} The rendered list of concerns.
 */
const ConcernList: FC<{ concerns: Concern[] }> = ({ concerns }) => (
  <Stack>
    {concerns.map((concern) => (
      <StackItem key={concern.category}>
        {getCategoryIcon(concern.category)} {concern.label}
      </StackItem>
    ))}
  </Stack>
);

/**
 * Renders a popover for a specific concern category.
 *
 * @param {Object} props - The properties of the ConcernPopover component.
 * @param {string} props.category - The category of the concern.
 * @param {Concern[]} props.concerns - The list of concerns for the category.
 * @returns {ReactElement} The rendered popover.
 */
const ConcernPopover: FC<{
  category: string;
  concerns: Concern[];
}> = ({ category, concerns }) => {
  const { t } = useForkliftTranslation();

  if (concerns.length < 1) return <></>;

  return (
    <Popover
      aria-label={`${category} popover`}
      headerContent={<div>{getCategoryTitle(category)}</div>}
      bodyContent={<ConcernList concerns={concerns} />}
      footerContent={t('Total: {{length}}', { length: concerns.length })}
    >
      <Button isInline variant={ButtonVariant.link}>
        <Label status={getCategoryStatus(category)}>{concerns.length}</Label>
      </Button>
    </Popover>
  );
};

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
