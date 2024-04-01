import React from 'react';
import { TFunction } from 'react-i18next';
import { TableCell, TableEmptyCell } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Concern } from '@kubev2v/types';
import {
  BlueInfoCircleIcon,
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { Button, Flex, FlexItem, Label, Popover, Stack, StackItem } from '@patternfly/react-core';

import { VMCellProps } from './VMCellProps';

/**
 * Renders a table cell containing concerns grouped by category.
 *
 * @param {VMCellProps} props - The properties of the VMConcernsCellRenderer component.
 * @returns {ReactElement} The rendered table cell.
 */
export const VMConcernsCellRenderer: React.FC<VMCellProps> = ({ data }) => {
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
const ConcernPopover: React.FC<{
  category: string;
  concerns: Concern[];
}> = ({ category, concerns }) => {
  const { t } = useForkliftTranslation();

  if (concerns.length < 1) return <></>;

  return (
    <Popover
      aria-label={`${category} popover`}
      headerContent={<div>{getCategoryTitle(category, t)}</div>}
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
const ConcernList: React.FC<{ concerns: Concern[] }> = ({ concerns }) => (
  <Stack>
    {concerns.map((c) => (
      <StackItem key={c.category}>
        {getCategoryIcon(c.category)} {c.label}
      </StackItem>
    ))}
  </Stack>
);

/**
 * Groups concerns by their category.
 *
 * @param {Concern[]} concerns - The list of concerns to group.
 * @returns {Record<string, Concern[]>} The grouped concerns by category.
 */
const groupConcernsByCategory = (concerns: Concern[] = []): Record<string, Concern[]> => {
  return concerns.reduce(
    (acc, concern) => {
      if (!acc[concern.category]) {
        acc[concern.category] = [];
      }
      acc[concern.category].push(concern);
      return acc;
    },
    {
      Critical: [],
      Information: [],
      Warning: [],
    },
  );
};

/**
 * Retrieves the title for a given concern category.
 *
 * @param {string} category - The category of the concern.
 * @param {TFunction} t - The translation function.
 * @returns {string} The title for the given category.
 */
const getCategoryTitle = (category: string, t: TFunction): string => {
  const titles = {
    Critical: t('Critical concerns'),
    Information: t('Information concerns'),
    Warning: t('Warning concerns'),
  };

  return titles[category] || '';
};

/**
 * Retrieves the icon for a given concern category.
 *
 * @param {string} category - The category of the concern.
 * @returns {ReactElement} The icon for the given category.
 */
const getCategoryIcon = (category: string) => {
  const icons = {
    Critical: <RedExclamationCircleIcon />,
    Information: <BlueInfoCircleIcon />,
    Warning: <YellowExclamationTriangleIcon />,
  };

  return icons[category] || <></>;
};

/**
 * Retrieves the color for a given concern category.
 *
 * @param {string} category - The category of the concern.
 * @returns {string} The color for the given category.
 */
const getCategoryColor = (category: string) => {
  const colors = {
    Critical: 'red',
    Information: 'blue',
    Warning: 'orange',
  };

  return colors[category] || 'grey';
};
