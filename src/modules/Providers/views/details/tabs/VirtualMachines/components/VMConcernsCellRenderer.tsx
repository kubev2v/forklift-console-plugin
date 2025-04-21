import type { FC } from 'react';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';
import { TableEmptyCell } from 'src/modules/Providers/utils/components/TableCell/TableEmptyCell';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { Concern } from '@kubev2v/types';
import { Button, Flex, FlexItem, Label, Popover, Stack, StackItem } from '@patternfly/react-core';

import {
  getCategoryColor,
  getCategoryIcon,
  getCategoryTitle,
} from '../utils/helpers/getCategoryTitle';
import { groupConcernsByCategory } from '../utils/helpers/groupConcernsByCategory';

import type { VMCellProps } from './VMCellProps';

/**
 * Renders a table cell containing concerns grouped by category.
 *
 * @param {VMCellProps} props - The properties of the VMConcernsCellRenderer component.
 * @returns {ReactElement} The rendered table cell.
 */
export const VMConcernsCellRenderer: FC<VMCellProps> = ({ data }) => {
  if (data?.vm?.providerType === 'openshift') {
    return <TableEmptyCell />;
  }

  const groupedConcerns = groupConcernsByCategory(data?.vm?.concerns);

  return (
    <TableCell>
      <Flex spaceItems={{ default: 'spaceItemsNone' }} flexWrap={{ default: 'nowrap' }}>
        {['Critical', 'Information', 'Warning'].map((category) => (
          <FlexItem key={category}>
            <ConcernPopover category={category} concerns={groupedConcerns[category] || []} />
          </FlexItem>
        ))}
      </Flex>
    </TableCell>
  );
};

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
      <Button variant="link" className="forklift-page-provider-vm_concern-button">
        <Label color={getCategoryColor(category)} icon={getCategoryIcon(category)}>
          {concerns.length}
        </Label>
      </Button>
    </Popover>
  );
};

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
