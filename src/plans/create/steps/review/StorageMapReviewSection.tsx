import type { FC } from 'react';
import { useWatch } from 'react-hook-form';

import ExpandableReviewSection from '@components/ExpandableReviewSection/ExpandableReviewSection';
import { useWizardContext } from '@patternfly/react-core';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks';
import { defaultStorageMapping, StorageMapFieldId } from '../storage-map/constants';

const StorageMapReviewSection: FC = () => {
  const { t } = useForkliftTranslation();
  const { goToStepById } = useWizardContext();
  const { control } = useCreatePlanFormContext();
  const storageMap = useWatch({ control, name: StorageMapFieldId.StorageMap });
  const noMappingsSelected =
    isEmpty(storageMap) ||
    (storageMap.length === 1 &&
      JSON.stringify(storageMap[0]) === JSON.stringify(defaultStorageMapping));

  return (
    <ExpandableReviewSection
      title={planStepNames[PlanWizardStepId.StorageMap]}
      onEditClick={() => {
        goToStepById(PlanWizardStepId.StorageMap);
      }}
    >
      {noMappingsSelected ? (
        t('No storage mappings selected')
      ) : (
        <Table aria-label="Storage map review table" variant={TableVariant.compact}>
          <Thead>
            <Tr>
              <Th width={50}>{t('Source storage')}</Th>
              <Th width={50}>{t('Target storage')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {storageMap.map((mapping) => {
              if (
                mapping[StorageMapFieldId.SourceStorage].name &&
                mapping[StorageMapFieldId.TargetStorage].name
              ) {
                return (
                  <Tr key={mapping[StorageMapFieldId.SourceStorage].name}>
                    <Td dataLabel={StorageMapFieldId.SourceStorage}>
                      {mapping[StorageMapFieldId.SourceStorage].name}
                    </Td>
                    <Td dataLabel={StorageMapFieldId.TargetStorage}>
                      {mapping[StorageMapFieldId.TargetStorage].name}
                    </Td>
                  </Tr>
                );
              }

              return null;
            })}
          </Tbody>
        </Table>
      )}
    </ExpandableReviewSection>
  );
};

export default StorageMapReviewSection;
