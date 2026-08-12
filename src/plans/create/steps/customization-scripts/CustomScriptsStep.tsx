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
      description={
        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
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
      title={planStepNames[PlanWizardStepId.Automation]}
    >
      <Form>
        <Controller
          control={control}
          name={CustomScriptsFieldId.ScriptsType}
          render={({ field: scriptsTypeField }) => (
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
              <FlexItem>
                <Stack hasGutter>
                  <Radio
                    data-testid="use-existing-configmap-radio"
                    description={t(
                      'Select a ConfigMap containing customization scripts. ConfigMaps must use the required naming convention.',
                    )}
                    id={CustomScriptsType.Existing}
                    isChecked={scriptsTypeField.value === CustomScriptsType.Existing}
                    label={ScriptsTypeLabels[CustomScriptsType.Existing]}
                    name={CustomScriptsFieldId.ScriptsType}
                    onChange={() => {
                      scriptsTypeField.onChange(CustomScriptsType.Existing);
                    }}
                    value={CustomScriptsType.Existing}
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
                    description={t(
                      'Define scripts that will be stored in a new ConfigMap. A new ConfigMap, with this plan as its owner, will be automatically created.',
                    )}
                    id={CustomScriptsType.New}
                    isChecked={scriptsTypeField.value === CustomScriptsType.New}
                    label={ScriptsTypeLabels[CustomScriptsType.New]}
                    name={CustomScriptsFieldId.ScriptsType}
                    onChange={() => {
                      scriptsTypeField.onChange(CustomScriptsType.New);
                    }}
                    value={CustomScriptsType.New}
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
