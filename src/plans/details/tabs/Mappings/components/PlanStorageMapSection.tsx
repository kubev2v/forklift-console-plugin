import type { FC } from 'react';
import StorageMapReviewTable from 'src/plans/create/steps/review/StorageMapReviewTable';

import { DetailsItem } from '@components/DetailItems/DetailItem';
import SectionHeadingWithEdit from '@components/headers/SectionHeadingWithEdit';
import {
  StorageMapModelGroupVersionKind,
  type V1beta1Plan,
  type V1beta1Provider,
  type V1beta1StorageMap,
} from '@forklift-ui/types';
import { ResourceLink, useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList } from '@patternfly/react-core';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import type { InventoryStorage } from '@utils/hooks/useStorages';
import { useForkliftTranslation } from '@utils/i18n';
import type { StorageMapping, TargetStorage } from '@utils/storage/types';
import type { MappingValue } from '@utils/types';

import { isPlanEditable } from '../../../components/PlanStatus/utils/utils';

import PlanStorageMapEdit from './PlanStorageMapEdit/PlanStorageMapEdit';
import type { PlanStorageMapEditProps } from './PlanStorageMapEdit/utils/types';

type PlanStorageMapSectionProps = {
  isLoading: boolean;
  loadError: Error | null;
  otherSourceStorages: MappingValue[];
  plan: V1beta1Plan;
  sourceProvider: V1beta1Provider;
  sourceStorages: InventoryStorage[];
  storageMap: V1beta1StorageMap;
  storageMappings: StorageMapping[];
  targetStorages: TargetStorage[];
  usedSourceStorages: MappingValue[];
};

const PlanStorageMapSection: FC<PlanStorageMapSectionProps> = ({
  isLoading,
  loadError,
  otherSourceStorages,
  plan,
  sourceProvider,
  sourceStorages,
  storageMap,
  storageMappings,
  targetStorages,
  usedSourceStorages,
}) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();

  return (
    <>
      <SectionHeadingWithEdit
        data-testid="storage-map-edit-button"
        editable={isPlanEditable(plan)}
        onClick={() => {
          launchOverlay<PlanStorageMapEditProps>(PlanStorageMapEdit, {
            isLoading,
            loadError,
            otherSourceStorages,
            sourceProvider,
            sourceStorages,
            storageMap,
            storageMappings,
            targetStorages,
            usedSourceStorages,
          });
        }}
        title={t('Storage map')}
      />
      <DescriptionList>
        <DetailsItem
          content={
            <ResourceLink
              groupVersionKind={StorageMapModelGroupVersionKind}
              name={getName(storageMap)}
              namespace={getNamespace(storageMap)}
            />
          }
          testId="storage-map-name-item"
          title={t('Storage map name')}
        />
      </DescriptionList>
      <StorageMapReviewTable storageMap={storageMappings} />
    </>
  );
};

export default PlanStorageMapSection;
