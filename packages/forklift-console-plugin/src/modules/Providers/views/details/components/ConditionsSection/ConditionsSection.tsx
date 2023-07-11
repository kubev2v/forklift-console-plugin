import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { K8sResourceCondition } from '@kubev2v/types';
import { Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

/**
 * React Component to display a table of conditions.
 *
 * @component
 * @param {ConditionsProps} props - Props for the Conditions component.
 * @param {K8sResourceCondition[]} props.conditions - Array of conditions to be displayed.
 * @returns {ReactElement} A table displaying the provided conditions.
 */
export const ConditionsSection: React.FC<ConditionsProps> = ({ conditions }) => {
  const { t } = useForkliftTranslation();

  if (!conditions) {
    return <></>;
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
    <>
      <TableComposable aria-label="Expandable table" variant="compact">
        <Thead>
          <Tr>
            <Th width={10}>{t('Type')}</Th>
            <Th width={10}>{t('Status')}</Th>
            <Th width={15}>{t('Updated')}</Th>
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
                <Timestamp timestamp={condition.lastTransitionTime} />
              </Td>
              <Td>{condition.reason}</Td>
              <Td modifier="truncate">{condition?.message || '-'}</Td>
            </Tr>
          ))}
        </Tbody>
      </TableComposable>
    </>
  );
};

/**
 * Type for the props of the Conditions component.
 *
 * @typedef {Object} ConditionsProps
 * @property {K8sResourceCondition[]} conditions - The conditions to be displayed.
 */
export type ConditionsProps = {
  conditions: K8sResourceCondition[];
};
