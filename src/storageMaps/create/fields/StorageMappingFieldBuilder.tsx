import type { FC } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useSourceStorages } from 'src/modules/Providers/hooks/useStorages';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import { FeatureGate } from '@components/FeatureGate';
import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import { FEATURE_NAMES } from '@utils/constants';
import { isEmpty } from '@utils/helpers';
import useTargetStorages from '@utils/hooks/useTargetStorages';
import { useForkliftTranslation } from '@utils/i18n';

import OffloadStorageIndexedForm from '../OffloadStorageIndexedForm/OffloadStorageIndexedForm';
import type { CreateStorageMapFormData } from '../types';

import {
  CreateStorageMapFieldId,
  createStorageMapFieldLabels,
  defaultStorageMapping,
} from './constants';
import SourceStorageField from './SourceStorageField';
import TargetStorageField from './TargetStorageField';
import { getCreateStorageMapFieldId, validateStorageMaps } from './utils';

const StorageMappingFieldBuilder: FC = () => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { isSubmitting },
    setValue,
  } = useFormContext<CreateStorageMapFormData>();
  const [project, sourceProvider, targetProvider] = useWatch({
    control,
    name: [
      CreateStorageMapFieldId.Project,
      CreateStorageMapFieldId.SourceProvider,
      CreateStorageMapFieldId.TargetProvider,
    ],
  });

  const {
    append,
    fields: storageMappingFields,
    remove,
  } = useFieldArray({
    control,
    name: CreateStorageMapFieldId.StorageMap,
    rules: {
      validate: (values) => validateStorageMaps(values),
    },
  });

  const [sourceStorages, sourceStoragesLoading, sourceStoragesError] =
    useSourceStorages(sourceProvider);
  const [targetStorages, _targetStoragesLoading, targetStoragesError] = useTargetStorages(
    targetProvider,
    project,
  );
  const loadError = sourceStoragesError ?? targetStoragesError;

  return (
    <FieldBuilderTable
      headers={[
        {
          isRequired: true,
          label: createStorageMapFieldLabels[CreateStorageMapFieldId.SourceStorage],
          width: 45,
        },
        {
          isRequired: true,
          label: createStorageMapFieldLabels[CreateStorageMapFieldId.TargetStorage],
          width: 45,
        },
      ]}
      fieldRows={storageMappingFields.map((field, index) => ({
        ...field,
        ...(sourceProvider?.spec?.type === PROVIDER_TYPES.vsphere && {
          additionalOptions: (
            <FeatureGate featureName={FEATURE_NAMES.COPY_OFFLOAD}>
              <OffloadStorageIndexedForm index={index} />
            </FeatureGate>
          ),
        }),
        inputs: [
          <SourceStorageField
            fieldId={getCreateStorageMapFieldId(CreateStorageMapFieldId.SourceStorage, index)}
            sourceStorages={sourceStorages}
          />,
          <TargetStorageField
            fieldId={getCreateStorageMapFieldId(CreateStorageMapFieldId.TargetStorage, index)}
            targetStorages={targetStorages}
          />,
        ],
      }))}
      addButton={{
        isDisabled:
          isEmpty([...sourceStorages, ...targetStorages]) ||
          sourceStorages.length === storageMappingFields.length ||
          sourceStoragesLoading ||
          isSubmitting ||
          Boolean(loadError),
        label: t('Add mapping'),
        onClick: () => {
          append(defaultStorageMapping);
        },
      }}
      removeButton={{
        isDisabled: isSubmitting,
        onClick: (index) => {
          if (storageMappingFields.length > 1) {
            remove(index);
            return;
          }

          setValue(CreateStorageMapFieldId.StorageMap, [defaultStorageMapping]);
        },
      }}
    />
  );
};

export default StorageMappingFieldBuilder;
