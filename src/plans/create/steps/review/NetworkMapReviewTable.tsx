import type { FC } from 'react';
import { useWatch } from 'react-hook-form';

import { Card } from '@patternfly/react-core';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { NetworkMapFieldId } from '../network-map/constants';

const NetworkMapReviewTable: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();
  const networkMap = useWatch({
    control,
    name: NetworkMapFieldId.NetworkMap,
  });

  if (!networkMap) {
    return null;
  }

  return (
    <Card>
      <Table aria-label="Network map review table" variant={TableVariant.compact} borders>
        <Thead>
          <Tr>
            <Th>{t('Source network')}</Th>
            <Th>{t('Target network')}</Th>
          </Tr>
        </Thead>

        <Tbody>
          {networkMap.map((mapping) => {
            // Only render rows that have both source and target network names
            if (
              mapping[NetworkMapFieldId.SourceNetwork].name &&
              mapping[NetworkMapFieldId.TargetNetwork].name
            ) {
              return (
                <Tr key={mapping[NetworkMapFieldId.SourceNetwork].name}>
                  <Td dataLabel={NetworkMapFieldId.SourceNetwork}>
                    {mapping[NetworkMapFieldId.SourceNetwork].name}
                  </Td>
                  <Td dataLabel={NetworkMapFieldId.TargetNetwork}>
                    {mapping[NetworkMapFieldId.TargetNetwork].name}
                  </Td>
                </Tr>
              );
            }

            return null;
          })}
        </Tbody>
      </Table>
    </Card>
  );
};

export default NetworkMapReviewTable;
