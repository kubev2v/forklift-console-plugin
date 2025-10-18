import { type FC, useEffect, useMemo } from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { StorageMapFieldId } from 'src/storageMaps/constants';

import type { V1beta1Provider, V1beta1StorageMap } from '@kubev2v/types';
import { Button, ButtonVariant, Flex, FlexItem, Split } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { StorageMappingValue, TargetStorage } from '../../types';
import type { UpdateMappingsFormData } from '../constants';
import { transformStorageMapToFormValues } from '../utils';

import UpdateStorageMapFieldTable from './UpdateStorageMapFieldTable';

import './UpdateStorageMapForm.style.scss';

type UpdateStorageMapFormProps = {
  storageMap: V1beta1StorageMap;
  targetStorages: TargetStorage[];
  usedSourceStorages: StorageMappingValue[];
  otherSourceStorages: StorageMappingValue[];
  isLoading: boolean;
  loadError: Error | null;
  isVsphere: boolean;
  onUpdate: (values: UpdateMappingsFormData) => Promise<void>;
  onCancel: () => void;
  sourceProvider: V1beta1Provider | undefined;
};

const UpdateStorageMapForm: FC<UpdateStorageMapFormProps> = ({
  isLoading,
  isVsphere,
  loadError,
  onCancel,
  onUpdate,
  otherSourceStorages,
  sourceProvider,
  storageMap,
  targetStorages,
  usedSourceStorages,
}) => {
  const { t } = useForkliftTranslation();

  const initialFormValues = useMemo(
    () => transformStorageMapToFormValues(storageMap),
    [storageMap],
  );

  const form = useForm<UpdateMappingsFormData>({
    defaultValues: initialFormValues,
    mode: 'onChange',
  });

  const {
    formState: { isDirty, isSubmitting, isValid },
    handleSubmit,
    reset,
    watch,
  } = form;
  const formValues = watch();

  // Reset form when storageMap changes
  useEffect(() => {
    reset(initialFormValues);
  }, [initialFormValues, reset]);

  const handleCancel = () => {
    reset(initialFormValues);
    onCancel();
  };

  const handleUpdateMappings = handleSubmit(async () => {
    const filteredStorageMap = formValues.storageMap?.filter((mapping) => {
      const hasSource = Boolean(mapping[StorageMapFieldId.SourceStorage]?.name);
      const hasTarget = Boolean(mapping[StorageMapFieldId.TargetStorage]?.name);

      return hasSource || hasTarget;
    });

    await onUpdate({
      storageMap: filteredStorageMap,
    });
  });

  return (
    <FormProvider {...form}>
      <Flex
        direction={{ default: 'column' }}
        spaceItems={{ default: 'spaceItemsXl' }}
        className="update-storage-map-form"
      >
        <FlexItem>
          <Split hasGutter>
            <Button
              onClick={handleUpdateMappings}
              isDisabled={!isValid || isSubmitting || !isDirty}
              isLoading={isSubmitting}
            >
              {t('Update mappings')}
            </Button>

            <Button
              variant={ButtonVariant.secondary}
              onClick={handleCancel}
              isDisabled={!isDirty || isSubmitting}
            >
              {t('Cancel')}
            </Button>
          </Split>
        </FlexItem>

        <Form>
          <UpdateStorageMapFieldTable
            targetStorages={targetStorages}
            usedSourceStorages={usedSourceStorages}
            otherSourceStorages={otherSourceStorages}
            isLoading={isLoading}
            loadError={loadError}
            isVsphere={isVsphere}
            sourceProvider={sourceProvider}
          />
        </Form>
      </Flex>
    </FormProvider>
  );
};

export default UpdateStorageMapForm;
