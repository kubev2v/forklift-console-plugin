import type { FC } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import WizardStepContainer from '@components/common/WizardStepContainer';
import { Form, FormSection, MenuToggleStatus, TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import ProviderSelect from '../../../components/ProviderSelect';
import { useCreatePlanFormContext } from '../../hooks';
import { NetworkMapFieldId } from '../network-mappings/constants';
import { VmFormFieldId } from '../virtual-machines/constants';

import { GeneralFormFieldId, generalFormFieldLabels } from './constants';
import PlanProjectField from './PlanProjectField';
import TargetProjectField from './TargetProjectField';

const GeneralInformationStep: FC = () => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { errors },
    setValue,
    unregister,
  } = useCreatePlanFormContext();
  const [planProject, targetProject] = useWatch({
    control,
    name: [GeneralFormFieldId.PlanProject, GeneralFormFieldId.TargetProject],
  });

  return (
    <WizardStepContainer title={t('General')}>
      <Form>
        <FormSection title={t('Plan information')} titleElement="h3">
          <p>{t('Name your plan and choose the project you would like it to be created in.')}</p>

          <FormGroupWithErrorText
            isRequired
            fieldId={GeneralFormFieldId.PlanName}
            label={generalFormFieldLabels[GeneralFormFieldId.PlanName]}
          >
            <Controller
              name={GeneralFormFieldId.PlanName}
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  validated={getInputValidated(Boolean(errors[GeneralFormFieldId.PlanName]))}
                />
              )}
              rules={{ required: t('Plan name is required.') }}
            />
          </FormGroupWithErrorText>

          <PlanProjectField />
        </FormSection>

        <FormSection title={t('Source and target providers')} titleElement="h3">
          <p>
            {t(
              'Select the provider you would like to migrate your virtual machines from (source provider) and the provider you want to migrate your virtual machines to (target provider).',
            )}
          </p>

          <FormGroupWithErrorText
            isRequired
            fieldId={GeneralFormFieldId.SourceProvider}
            label={generalFormFieldLabels[GeneralFormFieldId.SourceProvider]}
          >
            <Controller
              name={GeneralFormFieldId.SourceProvider}
              control={control}
              render={({ field }) => (
                <ProviderSelect
                  placeholder={t('Select source provider')}
                  id={GeneralFormFieldId.SourceProvider}
                  namespace={planProject}
                  value={field.value?.metadata?.name ?? ''}
                  onSelect={(_, value) => {
                    field.onChange(value);
                    unregister([VmFormFieldId.Vms, NetworkMapFieldId.NetworkMappings]);
                  }}
                  status={errors[GeneralFormFieldId.SourceProvider] && MenuToggleStatus.danger}
                />
              )}
              rules={{ required: t('Source provider is required.') }}
            />
          </FormGroupWithErrorText>

          <FormGroupWithErrorText
            isRequired
            fieldId={GeneralFormFieldId.TargetProvider}
            label={generalFormFieldLabels[GeneralFormFieldId.TargetProvider]}
          >
            <Controller
              name={GeneralFormFieldId.TargetProvider}
              control={control}
              render={({ field }) => (
                <ProviderSelect
                  isTarget
                  placeholder={t('Select target provider')}
                  id={GeneralFormFieldId.TargetProvider}
                  namespace={planProject}
                  value={field.value?.metadata?.name ?? ''}
                  onSelect={(_, value) => {
                    field.onChange(value);

                    if (targetProject) {
                      setValue(GeneralFormFieldId.TargetProject, '', { shouldValidate: true });
                    }
                  }}
                  status={errors[GeneralFormFieldId.TargetProvider] && MenuToggleStatus.danger}
                />
              )}
              rules={{ required: t('Target provider is required.') }}
            />
          </FormGroupWithErrorText>

          <TargetProjectField />
        </FormSection>
      </Form>
    </WizardStepContainer>
  );
};

export default GeneralInformationStep;
