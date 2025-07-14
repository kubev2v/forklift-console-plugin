import { Controller } from 'react-hook-form';

import WizardStepContainer from '@components/common/WizardStepContainer';
import { Flex, FlexItem, Form, Radio, Stack } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { CreatePlanStorageMapFieldId, StorageMapType, storageMapTypeLabels } from './constants';
import ExistingStorageMapField from './ExistingStorageMapField';
import NewStorageMapFields from './NewStorageMapFields';

const StorageMapStep = () => {
  const { t } = useForkliftTranslation();
  const { control, unregister } = useCreatePlanFormContext();

  return (
    <WizardStepContainer
      title={planStepNames[PlanWizardStepId.StorageMap]}
      description={t('Select an existing storage map or use a new storage map.')}
      testId="create-plan-storage-map-step"
    >
      <Form>
        <Controller
          name={CreatePlanStorageMapFieldId.StorageMapType}
          control={control}
          render={({ field: storageTypeField }) => (
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
              <FlexItem>
                <Stack hasGutter>
                  <Radio
                    id={StorageMapType.Existing}
                    name={StorageMapType.Existing}
                    label={storageMapTypeLabels[StorageMapType.Existing]}
                    checked={storageTypeField.value === StorageMapType.Existing}
                    value={storageTypeField.value}
                    isChecked={storageTypeField.value === StorageMapType.Existing}
                    onChange={() => {
                      storageTypeField.onChange(StorageMapType.Existing);
                      unregister([
                        CreatePlanStorageMapFieldId.StorageMap,
                        CreatePlanStorageMapFieldId.StorageMapName,
                      ]);
                    }}
                    description={t(
                      'Existing storage map options are limited to those without an owner reference. Upon creation of this plan, a new storage map will be created with this plan as its owner.',
                    )}
                  />

                  {storageTypeField.value === StorageMapType.Existing && (
                    <ExistingStorageMapField />
                  )}
                </Stack>
              </FlexItem>

              <FlexItem>
                <Stack hasGutter>
                  <Radio
                    id={StorageMapType.New}
                    name={StorageMapType.New}
                    label={storageMapTypeLabels[StorageMapType.New]}
                    description={t(
                      'Use the suggested storage mapping and add mappings to it, or create a brand new one as needed. A new map, with this plan as its owner, will be automatically created based on your selected mappings.',
                    )}
                    checked={storageTypeField.value === StorageMapType.New}
                    value={storageTypeField.value}
                    isChecked={storageTypeField.value === StorageMapType.New}
                    onChange={() => {
                      storageTypeField.onChange(StorageMapType.New);
                      unregister(CreatePlanStorageMapFieldId.ExistingStorageMap);
                    }}
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
