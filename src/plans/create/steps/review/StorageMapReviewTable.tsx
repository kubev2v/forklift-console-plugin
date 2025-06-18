import type { FC } from 'react';
import { useWatch } from 'react-hook-form';

import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { CreatePlanStorageMapFieldId } from '../storage-map/constants';

const StorageMapReviewTable: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();
  const storageMap = useWatch({
    control,
    name: CreatePlanStorageMapFieldId.StorageMap,
  });

  if (!storageMap) {
    return null;
  }

  return (
    <Table aria-label="Storage map review table" variant={TableVariant.compact}>
      <Thead>
        <Tr>
          <Th width={50}>{t('Source storage')}</Th>
          <Th width={50}>{t('Target storage')}</Th>
        </Tr>
      </Thead>

      <Tbody>
        {storageMap.map((mapping) => {
          // Only render rows that have both source and target storage names
          if (
            mapping[CreatePlanStorageMapFieldId.SourceStorage].name &&
            mapping[CreatePlanStorageMapFieldId.TargetStorage].name
          ) {
            return (
              <Tr key={mapping[CreatePlanStorageMapFieldId.SourceStorage].name}>
                <Td dataLabel={CreatePlanStorageMapFieldId.SourceStorage}>
                  {mapping[CreatePlanStorageMapFieldId.SourceStorage].name}
                </Td>
                <Td dataLabel={CreatePlanStorageMapFieldId.TargetStorage}>
                  {mapping[CreatePlanStorageMapFieldId.TargetStorage].name}
                </Td>
              </Tr>
            );
          }

          return null;
        })}
      </Tbody>
    </Table>
  );
};

export default StorageMapReviewTable;
