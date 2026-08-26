import type { FC, ReactElement } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { CreatePlanStorageMapFieldId } from 'src/plans/create/steps/storage-map/constants';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import { FormErrorHelperText } from '@components/FormErrorHelperText';
import type { V1beta1Provider } from '@forklift-ui/types';
import { Spinner } from '@patternfly/react-core';
import { FEATURE_NAMES } from '@utils/constants';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';
import type { InventoryStorage } from '@utils/hooks/useStorages';
import { useForkliftTranslation } from '@utils/i18n';
import { StorageMapFieldId, type TargetStorage } from '@utils/storage/types';
import type { MappingValue } from '@utils/types';

import { defaultStorageMapping, storageMapFieldLabels } from '../../utils/constants';
import type { UpdateMappingsFormData } from '../utils/types';
import { validateUpdatedStorageMaps } from '../utils/utils';

import { getStorageMapEditFieldRowContent } from './getStorageMapEditFieldRowContent';

type UpdateStorageMapFieldTableProps = {
  inventorySourceStorages: InventoryStorage[];
  isLoading: boolean;
  isVsphere: boolean;
  loadError: Error | null;
  providersLoadError: Error | null;
  providersReady: boolean;
  sourceProvider: V1beta1Provider | undefined;
  sourceStorages: MappingValue[];
  targetStorages: TargetStorage[];
};

const UpdateStorageMapFieldTable: FC<UpdateStorageMapFieldTableProps> = ({
  inventorySourceStorages,
  isLoading,
  isVsphere,
  loadError,
  providersLoadError,
  providersReady,
  sourceProvider,
  sourceStorages,
  targetStorages,
}): ReactElement => {
  const { t } = useForkliftTranslation();
  const { isFeatureEnabled } = useFeatureFlags();
  const isVsphereOffload = isVsphere && isFeatureEnabled(FEATURE_NAMES.COPY_OFFLOAD);
  const {
    control,
    formState: { isSubmitting },
    setValue,
  } = useFormContext<UpdateMappingsFormData>();

  const {
    append,
    fields: storageMappingFields,
    remove,
  } = useFieldArray({
    control,
    name: StorageMapFieldId.StorageMap,
    rules: {
      validate: (values) => validateUpdatedStorageMaps(values),
    },
  });

  if (!providersReady) {
    if (providersLoadError) {
      return (
        <FormErrorHelperText error={{ message: providersLoadError.message, type: 'manual' }} />
      );
    }

    return <Spinner aria-label={t('Loading providers')} size="lg" />;
  }

  return (
    <>
      {providersLoadError ? (
        <FormErrorHelperText error={{ message: providersLoadError.message, type: 'manual' }} />
      ) : null}
      <FieldBuilderTable
        addButton={{
          isDisabled: isLoading || isSubmitting || Boolean(loadError),
          label: t('Add mapping'),
          onClick: () => {
            append({
              [CreatePlanStorageMapFieldId.SourceStorage]:
                defaultStorageMapping[CreatePlanStorageMapFieldId.SourceStorage],
              [CreatePlanStorageMapFieldId.TargetStorage]: {
                name:
                  targetStorages[0]?.name ??
                  defaultStorageMapping[CreatePlanStorageMapFieldId.TargetStorage].name,
              },
            });
          },
        }}
        fieldRows={storageMappingFields.map((field, index) => ({
          ...field,
          ...getStorageMapEditFieldRowContent({
            index,
            inventorySourceStorages,
            isVsphereOffload,
            sourceProvider,
            sourceStorages,
            targetStorages,
          }),
        }))}
        headers={[
          {
            label: storageMapFieldLabels[StorageMapFieldId.SourceStorage],
            width: 45,
          },
          {
            label: storageMapFieldLabels[StorageMapFieldId.TargetStorage],
            width: 45,
          },
        ]}
        removeButton={{
          isDisabled: () => isSubmitting,
          onClick: (index) => {
            if (storageMappingFields.length > 1) {
              remove(index);
              return;
            }

            setValue(StorageMapFieldId.StorageMap, [defaultStorageMapping]);
          },
        }}
      />
    </>
  );
};

export default UpdateStorageMapFieldTable;
