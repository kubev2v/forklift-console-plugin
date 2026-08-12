import { Controller, useWatch } from 'react-hook-form';

import WizardStepContainer from '@components/common/WizardStepContainer';
import { Flex, FlexItem, Form, Radio, Stack } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import {
  NetworkMapFieldId,
  NetworkMapType,
  networkMapTypeLabels,
} from '@utils/mappings/networkMap';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import ExistingNetworkMapField from './ExistingNetworkMapField';
import NewNetworkMapFields from './NewNetworkMapFields';

const NetworkMapStep = () => {
  const { t } = useForkliftTranslation();
  const { control, trigger, unregister } = useCreatePlanFormContext();

  const [existingNetworkMap, networkMap] = useWatch({
    control,
    name: [NetworkMapFieldId.ExistingNetworkMap, NetworkMapFieldId.NetworkMap],
  });

  const handleNetworkMapTypeChange = (newType: NetworkMapType) => {
    setTimeout(async () => {
      if (newType === NetworkMapType.Existing && !existingNetworkMap) {
        await trigger(NetworkMapFieldId.ExistingNetworkMap);
      } else if (newType === NetworkMapType.New && !networkMap) {
        await trigger(NetworkMapFieldId.NetworkMap);
      }
    }, 0);
  };

  return (
    <WizardStepContainer
      description={t('Select an existing network map or use a new network map.')}
      testId="create-plan-network-map-step"
      title={planStepNames[PlanWizardStepId.NetworkMap]}
    >
      <Form>
        <Controller
          control={control}
          name={NetworkMapFieldId.NetworkMapType}
          render={({ field: networkTypeField }) => (
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
              <FlexItem>
                <Stack hasGutter>
                  <Radio
                    checked={networkTypeField.value === NetworkMapType.Existing}
                    data-testid="use-existing-network-map-radio"
                    description={t(
                      'Existing network map options are limited to those without an owner reference. Upon creation of this plan, a new network map will be created with this plan as its owner.',
                    )}
                    id={NetworkMapType.Existing}
                    isChecked={networkTypeField.value === NetworkMapType.Existing}
                    label={networkMapTypeLabels[NetworkMapType.Existing]}
                    name={NetworkMapType.Existing}
                    onChange={() => {
                      networkTypeField.onChange(NetworkMapType.Existing);
                      unregister([NetworkMapFieldId.NetworkMap, NetworkMapFieldId.NetworkMapName]);
                      handleNetworkMapTypeChange(NetworkMapType.Existing);
                    }}
                    value={networkTypeField.value}
                  />

                  {networkTypeField.value === NetworkMapType.Existing && (
                    <ExistingNetworkMapField />
                  )}
                </Stack>
              </FlexItem>

              <FlexItem>
                <Stack hasGutter>
                  <Radio
                    checked={networkTypeField.value === NetworkMapType.New}
                    data-testid="use-new-network-map-radio"
                    description={t(
                      'Use the suggested network mapping and add mappings to it, or create a brand new one as needed. A new map, with this plan as its owner, will be automatically created based on your selected mappings.',
                    )}
                    id={NetworkMapType.New}
                    isChecked={networkTypeField.value === NetworkMapType.New}
                    label={networkMapTypeLabels[NetworkMapType.New]}
                    name={NetworkMapType.New}
                    onChange={() => {
                      networkTypeField.onChange(NetworkMapType.New);
                      unregister(NetworkMapFieldId.ExistingNetworkMap);
                      handleNetworkMapTypeChange(NetworkMapType.New);
                    }}
                    value={networkTypeField.value}
                  />

                  {networkTypeField.value === NetworkMapType.New && <NewNetworkMapFields />}
                </Stack>
              </FlexItem>
            </Flex>
          )}
        />
      </Form>
    </WizardStepContainer>
  );
};

export default NetworkMapStep;
