import { type FC, useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { defaultStorageMapping } from 'src/storageMaps/constants';

import ExpandableReviewSection from '@components/ExpandableReviewSection/ExpandableReviewSection';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  useWizardContext,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { CreatePlanStorageMapFieldId, StorageMapType } from '../storage-map/constants';

import StorageMapReviewTable from './StorageMapReviewTable';

const StorageMapReviewSectionInner: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();

  const [storageMapType, storageMap, existingNetMap, netMapName] = useWatch({
    control,
    name: [
      CreatePlanStorageMapFieldId.StorageMapType,
      CreatePlanStorageMapFieldId.StorageMap,
      CreatePlanStorageMapFieldId.ExistingStorageMap,
      CreatePlanStorageMapFieldId.StorageMapName,
    ],
  });

  const noMappingsSelected = useMemo(() => {
    return (
      isEmpty(storageMap) ||
      (storageMap.length === 1 &&
        JSON.stringify(storageMap[0]) === JSON.stringify(defaultStorageMapping))
    );
  }, [storageMap]);

  if (storageMapType === StorageMapType.Existing) {
    return (
      <DescriptionList isHorizontal horizontalTermWidthModifier={{ default: '18ch' }}>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Storage map')}</DescriptionListTerm>
          <DescriptionListDescription data-testid="review-storage-map">
            {existingNetMap?.metadata?.name}
          </DescriptionListDescription>
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

        <StorageMapReviewTable />
      </Stack>
    );
  }

  return <StorageMapReviewTable />;
};

const StorageMapReviewSection: FC = () => {
  const { goToStepById } = useWizardContext();

  return (
    <ExpandableReviewSection
      title={planStepNames[PlanWizardStepId.StorageMap]}
      testId="review-storage-map-section"
      onEditClick={() => {
        goToStepById(PlanWizardStepId.StorageMap);
      }}
    >
      <StorageMapReviewSectionInner />
    </ExpandableReviewSection>
  );
};

export default StorageMapReviewSection;
