import { type FC, useCallback } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import WizardStepContainer from '@components/common/WizardStepContainer';
import ProviderSelect from '@components/ProviderSelect/ProviderSelect';
import { Form, FormSection, MenuToggleStatus } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { NetworkMapFieldId } from '@utils/mappings/networkMap';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { validateVmSelection } from '../../utils/vmValidation';
import { MigrationTypeFieldId } from '../migration-type/constants';
import { CreatePlanStorageMapFieldId } from '../storage-map/constants';
import { VmFormFieldId } from '../virtual-machines/constants';

import { GeneralFormFieldId, generalFormFieldLabels } from './constants';
import PlanDescriptionField from './PlanDescriptionField';
import PlanNameField from './PlanNameField';
import PlanProjectField from './PlanProjectField';
import TargetProjectField from './TargetProjectField';

const GeneralInformationStep: FC = () => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { errors },
    setError,
    setValue,
    unregister,
  } = useCreatePlanFormContext();
  const [planProject, targetProject] = useWatch({
    control,
    name: [GeneralFormFieldId.PlanProject, GeneralFormFieldId.TargetProject],
  });

  const handleSourceProviderChange = useCallback(() => {
    setValue(VmFormFieldId.Vms, {}, { shouldDirty: true, shouldValidate: true });

    // Set validation error since no VMs are selected after provider change
    const validationError = validateVmSelection({});
    if (validationError) {
      setError(VmFormFieldId.Vms, {
        message: validationError,
        type: 'manual',
      });
    }

    unregister([
      NetworkMapFieldId.NetworkMap,
      CreatePlanStorageMapFieldId.StorageMap,
      MigrationTypeFieldId.MigrationType,
    ]);
  }, [setValue, setError, unregister]);

  return (
    <WizardStepContainer
      testId="create-plan-general-step"
      title={planStepNames[PlanWizardStepId.General]}
    >
      <Form>
        <FormSection title={t('Plan information')}>
          <p>{t('Name your plan and choose the project you would like it to be created in.')}</p>

          <PlanNameField />
          <PlanProjectField testId="plan-project-select" />
          <PlanDescriptionField />
        </FormSection>

        <FormSection title={t('Source and target providers')}>
          <p>
            {t(
              'Select the provider you would like to migrate your virtual machines from (source provider) and the provider you want to migrate your virtual machines to (target provider).',
            )}
          </p>

          <FormGroupWithErrorText
            fieldId={GeneralFormFieldId.SourceProvider}
            isRequired
            label={generalFormFieldLabels[GeneralFormFieldId.SourceProvider]}
          >
            <Controller
              control={control}
              name={GeneralFormFieldId.SourceProvider}
              render={({ field }) => (
                <ProviderSelect
                  id={GeneralFormFieldId.SourceProvider}
                  namespace={planProject}
                  onSelect={(_, value) => {
                    const previousProvider = field.value;
                    field.onChange(value);

                    // Only reset and force errors if there was already a provider selected
                    if (previousProvider?.metadata?.name) {
                      handleSourceProviderChange();
                    }
                  }}
                  placeholder={t('Select source provider')}
                  ref={field.ref}
                  status={errors[GeneralFormFieldId.SourceProvider] && MenuToggleStatus.danger}
                  testId="source-provider-select"
                  value={field.value?.metadata?.name ?? ''}
                />
              )}
              rules={{ required: t('Source provider is required.') }}
            />
          </FormGroupWithErrorText>

          <FormGroupWithErrorText
            fieldId={GeneralFormFieldId.TargetProvider}
            isRequired
            label={generalFormFieldLabels[GeneralFormFieldId.TargetProvider]}
          >
            <Controller
              control={control}
              name={GeneralFormFieldId.TargetProvider}
              render={({ field }) => (
                <ProviderSelect
                  id={GeneralFormFieldId.TargetProvider}
                  isTarget
                  namespace={planProject}
                  onSelect={(_, value) => {
                    field.onChange(value);

                    if (targetProject) {
                      setValue(GeneralFormFieldId.TargetProject, '', { shouldValidate: true });
                    }
                  }}
                  placeholder={t('Select target provider')}
                  ref={field.ref}
                  status={errors[GeneralFormFieldId.TargetProvider] && MenuToggleStatus.danger}
                  testId="target-provider-select"
                  value={field.value?.metadata?.name ?? ''}
                />
              )}
              rules={{ required: t('Target provider is required.') }}
            />
          </FormGroupWithErrorText>

          <TargetProjectField testId="target-project-select" />
        </FormSection>
      </Form>
    </WizardStepContainer>
  );
};

export default GeneralInformationStep;
