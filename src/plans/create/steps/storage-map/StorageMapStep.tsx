import type { ReactElement } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import WizardStepContainer from '@components/common/WizardStepContainer';
import { Flex, FlexItem, Form, Radio, Stack } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { CreatePlanStorageMapFieldId, StorageMapType, storageMapTypeLabels } from './constants';
import ExistingStorageMapField from './ExistingStorageMapField';
import NewStorageMapFields from './NewStorageMapFields';

const StorageMapStep = (): ReactElement => {
  const { t } = useForkliftTranslation();
  const { control, trigger, unregister } = useCreatePlanFormContext();

  const [existingStorageMap, storageMap] = useWatch({
    control,
    name: [CreatePlanStorageMapFieldId.ExistingStorageMap, CreatePlanStorageMapFieldId.StorageMap],
  });

  const handleStorageMapTypeChange = (newType: StorageMapType): void => {
    setTimeout(async () => {
      if (newType === StorageMapType.Existing && !existingStorageMap) {
        await trigger(CreatePlanStorageMapFieldId.ExistingStorageMap);
      } else if (newType === StorageMapType.New && !storageMap) {
        await trigger(CreatePlanStorageMapFieldId.StorageMap);
      }
    }, 0);
  };

  return (
    <WizardStepContainer
      description={t('Select an existing storage map or use a new storage map.')}
      testId="create-plan-storage-map-step"
      title={planStepNames[PlanWizardStepId.StorageMap]}
    >
      <Form>
        <Controller
          control={control}
          name={CreatePlanStorageMapFieldId.StorageMapType}
          render={({ field: storageTypeField }) => (
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
              <FlexItem>
                <Stack hasGutter>
                  <Radio
                    checked={storageTypeField.value === StorageMapType.Existing}
                    data-testid="use-existing-storage-map-radio"
                    description={t(
                      'Existing storage map options are limited to those without an owner reference. Upon creation of this plan, a new storage map will be created with this plan as its owner.',
                    )}
                    id={StorageMapType.Existing}
                    isChecked={storageTypeField.value === StorageMapType.Existing}
                    label={storageMapTypeLabels[StorageMapType.Existing]}
                    name={StorageMapType.Existing}
                    onChange={() => {
                      storageTypeField.onChange(StorageMapType.Existing);
                      unregister([
                        CreatePlanStorageMapFieldId.StorageMap,
                        CreatePlanStorageMapFieldId.StorageMapName,
                      ]);
                      handleStorageMapTypeChange(StorageMapType.Existing);
                    }}
                    value={StorageMapType.Existing}
                  />

                  {storageTypeField.value === StorageMapType.Existing && (
                    <ExistingStorageMapField />
                  )}
                </Stack>
              </FlexItem>

              <FlexItem>
                <Stack hasGutter>
                  <Radio
                    checked={storageTypeField.value === StorageMapType.New}
                    data-testid="use-new-storage-map-radio"
                    description={t(
                      'Use the suggested storage mapping and add mappings to it, or create a brand new one as needed. A new map, with this plan as its owner, will be automatically created based on your selected mappings.',
                    )}
                    id={StorageMapType.New}
                    isChecked={storageTypeField.value === StorageMapType.New}
                    label={storageMapTypeLabels[StorageMapType.New]}
                    name={StorageMapType.New}
                    onChange={() => {
                      storageTypeField.onChange(StorageMapType.New);
                      unregister(CreatePlanStorageMapFieldId.ExistingStorageMap);
                      handleStorageMapTypeChange(StorageMapType.New);
                    }}
                    value={StorageMapType.New}
                  />

                  {storageTypeField.value === StorageMapType.New && <NewStorageMapFields />}
                </Stack>
              </FlexItem>
            </Flex>
          )}
        />
      </Form>
    </WizardStepContainer>
  );
};

export default StorageMapStep;
