import type { FC } from 'react';

import { getCategoryStatus } from '@components/Concerns/utils/category';
import { DetailsItem } from '@components/DetailItems/DetailItem';
import { DescriptionList, Label } from '@patternfly/react-core';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import type { InspectionConcern } from '@utils/crds/conversion/types';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

type InspectionIssuesTableProps = {
  concerns: InspectionConcern[] | undefined;
};

const InspectionIssuesTable: FC<InspectionIssuesTableProps> = ({ concerns }) => {
  const { t } = useForkliftTranslation();

  return (
    <DescriptionList isCompact columnModifier={{ default: '1Col' }}>
      <DetailsItem
        title={t('Issues found')}
        content={
          isEmpty(concerns) ? (
            <>{t('None')}</>
          ) : (
            <Table aria-label={t('Issues found')} variant={TableVariant.compact}>
              <Thead>
                <Tr>
                  <Th>{t('Issue')}</Th>
                  <Th>{t('Severity')}</Th>
                  <Th>{t('Description')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {concerns!.map((concern) => (
                  <Tr key={concern.id}>
                    <Td>{concern.label}</Td>
                    <Td>
                      <Label status={getCategoryStatus(concern.category)}>{concern.category}</Label>
                    </Td>
                    <Td>{concern.message}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )
        }
      />
    </DescriptionList>
  );
};

export default InspectionIssuesTable;
