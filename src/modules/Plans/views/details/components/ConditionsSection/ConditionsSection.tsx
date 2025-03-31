import React from 'react';
import { ConsoleTimestamp } from 'src/components/ConsoleTimestamp';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { K8sResourceCondition } from '@kubev2v/types';
import { HelperText, HelperTextItem } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

/**
 * React Component to display a table of conditions.
 *
 * @component
 * @param {ConditionsSectionProps} props - Props for the Conditions component.
 * @param {K8sResourceCondition[]} props.conditions - Array of conditions to be displayed.
 * @returns {ReactElement} A table displaying the provided conditions.
 */
export const ConditionsSection: React.FC<ConditionsSectionProps> = ({ conditions }) => {
  const { t } = useForkliftTranslation();

  if (!conditions) {
    return (
      <HelperText>
        <HelperTextItem>{t('Conditions not found')}</HelperTextItem>
      </HelperText>
    );
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'True':
        return t('True');
      case 'False':
        return t('False');
      default:
        return status;
    }
  };

  return (
    <Table aria-label="Expandable table" variant="compact">
      <Thead>
        <Tr>
          <Th width={10}>{t('Type')}</Th>
          <Th width={10}>{t('Status')}</Th>
          <Th width={20}>{t('Updated')}</Th>
          <Th width={10}>{t('Reason')}</Th>
          <Th> {t('Message')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {conditions.map((condition) => (
          <Tr key={condition.type}>
            <Td>{condition.type}</Td>
            <Td>{getStatusLabel(condition.status)}</Td>
            <Td>
              <ConsoleTimestamp timestamp={condition.lastTransitionTime} />
            </Td>
            <Td>{condition.reason}</Td>
            <Td modifier="truncate">{condition?.message || '-'}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

/**
 * Type for the props of the Conditions component.
 *
 * @typedef {Object} ConditionsProps
 * @property {K8sResourceCondition[]} conditions - The conditions to be displayed.
 */
export type ConditionsSectionProps = {
  conditions: K8sResourceCondition[];
};
