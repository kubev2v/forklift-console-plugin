import { Controller } from 'react-hook-form';

import WizardStepContainer from '@components/common/WizardStepContainer';
import { Flex, FlexItem, Form, Radio, Stack } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { StorageMapFieldId, StorageMapType, storageMapTypeLabels } from './constants';
import ExistingStorageMapField from './ExistingStorageMapField';
import NewStorageMapFields from './NewStorageMapFields';

const StorageMapStep = () => {
  const { t } = useForkliftTranslation();
  const { control, unregister } = useCreatePlanFormContext();

  return (
    <WizardStepContainer title={planStepNames[PlanWizardStepId.StorageMap]}>
      <Form>
        <Controller
          name={StorageMapFieldId.StorageMapType}
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
                      unregister([StorageMapFieldId.StorageMap, StorageMapFieldId.StorageMapName]);
                    }}
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
                      'Use the suggested storage map, add mappings to it, or create a brand new one as needed.',
                    )}
                    checked={storageTypeField.value === StorageMapType.New}
                    value={storageTypeField.value}
                    isChecked={storageTypeField.value === StorageMapType.New}
                    onChange={() => {
                      storageTypeField.onChange(StorageMapType.New);
                      unregister(StorageMapFieldId.ExistingStorageMap);
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
