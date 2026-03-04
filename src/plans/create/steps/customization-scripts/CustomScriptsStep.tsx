import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import WizardStepContainer from '@components/common/WizardStepContainer';
import TechPreviewLabel from '@components/PreviewLabels/TechPreviewLabel';
import { Flex, FlexItem, Form, Radio, Stack } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { CustomScriptsFieldId, CustomScriptsType, ScriptsTypeLabels } from './constants';
import ExistingConfigMapField from './ExistingConfigMapField';
import NewScriptsFields from './NewScriptsFields';

const CustomScriptsStep: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();

  return (
    <WizardStepContainer
      title={planStepNames[PlanWizardStepId.CustomizationScripts]}
      description={
        <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            {t(
              'Specify customization scripts to run during guest conversion. Scripts are injected via virt-customize and executed on the VM.',
            )}
          </FlexItem>
          <FlexItem>
            <TechPreviewLabel />
          </FlexItem>
        </Flex>
      }
      testId="create-plan-custom-scripts-step"
    >
      <Form>
        <Controller
          name={CustomScriptsFieldId.ScriptsType}
          control={control}
          render={({ field: scriptsTypeField }) => (
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
              <FlexItem>
                <Stack hasGutter>
                  <Radio
                    data-testid="use-existing-configmap-radio"
                    id={CustomScriptsType.Existing}
                    name={CustomScriptsFieldId.ScriptsType}
                    label={ScriptsTypeLabels[CustomScriptsType.Existing]}
                    value={CustomScriptsType.Existing}
                    isChecked={scriptsTypeField.value === CustomScriptsType.Existing}
                    onChange={() => {
                      scriptsTypeField.onChange(CustomScriptsType.Existing);
                    }}
                    description={t(
                      'Select a ConfigMap containing customization scripts. ConfigMaps must use the required naming convention.',
                    )}
                  />

                  {scriptsTypeField.value === CustomScriptsType.Existing && (
                    <ExistingConfigMapField />
                  )}
                </Stack>
              </FlexItem>

              <FlexItem>
                <Stack hasGutter>
                  <Radio
                    data-testid="use-new-scripts-radio"
                    id={CustomScriptsType.New}
                    name={CustomScriptsFieldId.ScriptsType}
                    label={ScriptsTypeLabels[CustomScriptsType.New]}
                    description={t(
                      'Define scripts that will be stored in a new ConfigMap. A new ConfigMap, with this plan as its owner, will be automatically created.',
                    )}
                    value={CustomScriptsType.New}
                    isChecked={scriptsTypeField.value === CustomScriptsType.New}
                    onChange={() => {
                      scriptsTypeField.onChange(CustomScriptsType.New);
                    }}
                  />

                  {scriptsTypeField.value === CustomScriptsType.New && <NewScriptsFields />}
                </Stack>
              </FlexItem>
            </Flex>
          )}
        />
      </Form>
    </WizardStepContainer>
  );
};

export default CustomScriptsStep;
