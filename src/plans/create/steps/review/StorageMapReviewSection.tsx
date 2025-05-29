import { type FC, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import ExpandableReviewSection from '@components/ExpandableReviewSection/ExpandableReviewSection';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  useWizardContext,
} from '@patternfly/react-core';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { defaultStorageMapping, StorageMapFieldId, StorageMapType } from '../storage-map/constants';

const StorageMapReviewSectionInner: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();

  const [storageMapType, storageMap, existingNetMap, netMapName] = useWatch({
    control,
    name: [
      StorageMapFieldId.StorageMapType,
      StorageMapFieldId.StorageMap,
      StorageMapFieldId.ExistingStorageMap,
      StorageMapFieldId.StorageMapName,
    ],
  });

  const noMappingsSelected = useMemo(() => {
    return (
      isEmpty(storageMap) ||
      (storageMap.length === 1 &&
        JSON.stringify(storageMap[0]) === JSON.stringify(defaultStorageMapping))
    );
  }, [storageMap]);

  const storageMapTable = useMemo(() => {
    if (!storageMap) return null;

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
    );
  }, [storageMap, t]);

  if (storageMapType === StorageMapType.Existing) {
    return (
      <DescriptionList isHorizontal horizontalTermWidthModifier={{ default: '18ch' }}>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Storage map')}</DescriptionListTerm>
          <DescriptionListDescription>{existingNetMap?.metadata?.name}</DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    );
  }

  if (noMappingsSelected) {
    return <>{t('No storage mappings selected')}</>;
  }

  if (netMapName) {
    return (
      <Stack hasGutter>
        <DescriptionList isHorizontal horizontalTermWidthModifier={{ default: '18ch' }}>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Storage map name')}</DescriptionListTerm>
            <DescriptionListDescription>{netMapName}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>

        {storageMapTable}
      </Stack>
    );
  }

  return storageMapTable;
};

const StorageMapReviewSection: FC = () => {
  const { goToStepById } = useWizardContext();

  return (
    <ExpandableReviewSection
      title={planStepNames[PlanWizardStepId.StorageMap]}
      onEditClick={() => {
        goToStepById(PlanWizardStepId.StorageMap);
      }}
    >
      <StorageMapReviewSectionInner />
    </ExpandableReviewSection>
  );
};

export default StorageMapReviewSection;
