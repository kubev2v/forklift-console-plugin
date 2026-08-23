import { useEffect } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { validatePlanStorageMaps } from 'src/plans/create/steps/storage-map/utils';

import type { V1beta1Provider } from '@forklift-ui/types';
import { FEATURE_NAMES } from '@utils/constants';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import { StorageMapFieldId } from '@utils/storage/types';
import type { MappingValue } from '@utils/types';

import type { PlanStorageEditFormValues } from '../utils/types';

type UsePlanStorageMapFieldsTableArgs = {
  isIscsi?: boolean;
  sourceProvider: V1beta1Provider;
  usedSourceStorages: MappingValue[];
};

type UsePlanStorageMapFieldsTableResult = {
  fieldArray: ReturnType<typeof useFieldArray<PlanStorageEditFormValues, 'storageMap'>>;
  isVsphereOffload: boolean;
  storageMappings: PlanStorageEditFormValues['storageMap'] | undefined;
  trigger: ReturnType<typeof useFormContext<PlanStorageEditFormValues>>['trigger'];
};

export const usePlanStorageMapFieldsTable = ({
  isIscsi,
  sourceProvider,
  usedSourceStorages,
}: UsePlanStorageMapFieldsTableArgs): UsePlanStorageMapFieldsTableResult => {
  const { isFeatureEnabled } = useFeatureFlags();
  const isCopyOffloadEnabled = isFeatureEnabled(FEATURE_NAMES.COPY_OFFLOAD);
  const isOpenshift = sourceProvider?.spec?.type === PROVIDER_TYPES.openshift;
  const isVsphereOffload =
    sourceProvider?.spec?.type === PROVIDER_TYPES.vsphere && isCopyOffloadEnabled;

  const { control, trigger } = useFormContext<PlanStorageEditFormValues>();

  const storageMappings = useWatch({
    control,
    name: StorageMapFieldId.StorageMap,
  });

  const fieldArray = useFieldArray({
    control,
    name: StorageMapFieldId.StorageMap,
    rules: {
      validate: (values) =>
        validatePlanStorageMaps(values, usedSourceStorages, isOpenshift, isIscsi),
    },
  });

  useEffect(() => {
    setTimeout(async () => {
      await trigger();
    }, 0);
  }, [trigger]);

  return {
    fieldArray,
    isVsphereOffload,
    storageMappings,
    trigger,
  };
};
