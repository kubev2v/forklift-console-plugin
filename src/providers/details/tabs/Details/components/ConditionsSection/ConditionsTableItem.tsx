import type { FC, ReactElement } from 'react';

import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { EMPTY_CELL_CONTENT } from '@utils/constants';
import { useForkliftTranslation } from '@utils/i18n';

import type { ConditionsSectionProps } from './ConditionsSection';

const ConditionsTableItem: FC<ConditionsSectionProps> = ({ conditions }): ReactElement => {
  const { t } = useForkliftTranslation();

  return (
    <Table variant={TableVariant.compact}>
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
        {conditions?.map((condition) => (
          <Tr key={condition?.type}>
            <Td>{condition?.type}</Td>
            <Td>{t(condition?.status)}</Td>
            <Td>
              <ConsoleTimestamp timestamp={condition?.lastTransitionTime ?? null} />
            </Td>
            <Td>{condition?.reason}</Td>
            <Td modifier="truncate">{condition?.message ?? EMPTY_CELL_CONTENT}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default ConditionsTableItem;
