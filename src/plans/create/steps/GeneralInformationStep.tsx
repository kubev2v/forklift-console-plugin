import React, { FC, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useNamespaces as useProviderNamespaces } from 'src/modules/Providers/hooks/useNamespaces';
import ProviderSelect from 'src/plans/components/ProviderSelect';

import ControlledFormGroup from '@components/common/ControlledFormGroup';
import { useProjectNameSelectOptions } from '@components/common/ProjectNameSelect';
import { TypeaheadSelect } from '@components/common/TypeaheadSelect';
import { WizardStepContainer } from '@components/common/WizardStepContainer';
import { V1beta1Provider } from '@kubev2v/types';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import {
  Form,
  FormSection,
  MenuToggleStatus,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';
import { Namespace } from '@utils/constants';
import { useForkliftTranslation } from '@utils/i18n';
import { getDefaultNamespace } from '@utils/namespaces';

import { GeneralFormFieldId, generalFormFieldLabels } from './constants';

export const GeneralInformationStep: FC = () => {
  const { t } = useForkliftTranslation();
  const {
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();
  const [providerNamespace, setProviderNamespace] = useState<string>();
  const planProject: string = watch(GeneralFormFieldId.PlanProject);
  const targetProject: string = watch(GeneralFormFieldId.TargetProject);
  const targetProvider: V1beta1Provider = watch(GeneralFormFieldId.TargetProvider);
  const sourceProvider: V1beta1Provider = watch(GeneralFormFieldId.SourceProvider);
  const [activeNamespace] = useActiveNamespace();
  const defaultNamespace = getDefaultNamespace();
  const initialProjectName =
    planProject || (activeNamespace === Namespace.AllProjects ? defaultNamespace : activeNamespace);
  const projectOptions = useProjectNameSelectOptions();
  const [targetProviderProjects, targetProviderProjectsLoading] =
    useProviderNamespaces(targetProvider);

  return (
    <WizardStepContainer title={t('General')}>
      <Form>
        <FormSection title={t('Plan information')} titleElement="h3">
          <p>{t('Name your plan and choose the project you would like it to be created in.')}</p>

          <ControlledFormGroup
            isRequired
            fieldId={GeneralFormFieldId.PlanName}
            label={generalFormFieldLabels[GeneralFormFieldId.PlanName]}
            controller={{
              rules: { required: t('Plan name is required.') },
              render: ({ field }) => (
                <TextInput
                  {...field}
                  validated={
                    errors[GeneralFormFieldId.PlanName]
                      ? ValidatedOptions.error
                      : ValidatedOptions.default
                  }
                />
              ),
            }}
          />

          <ControlledFormGroup
            isRequired
            fieldId={GeneralFormFieldId.PlanProject}
            label={generalFormFieldLabels[GeneralFormFieldId.PlanProject]}
            controller={{
              ...(projectOptions?.find((option) => option.value === initialProjectName) && {
                defaultValue: initialProjectName,
              }),
              rules: { required: t('Plan project is required.') },
              render: ({ field }) => (
                <div ref={field.ref}>
                  <TypeaheadSelect
                    placeholder={t('Select plan project')}
                    id={GeneralFormFieldId.PlanProject}
                    selectOptions={projectOptions}
                    selected={field.value}
                    onSelect={(_, value) => {
                      field.onChange(value);
                      setProviderNamespace(value.toString());

                      if (sourceProvider) {
                        setValue(GeneralFormFieldId.SourceProvider, '', { shouldValidate: true });
                      }
                      if (targetProvider) {
                        setValue(GeneralFormFieldId.TargetProvider, '', { shouldValidate: true });
                      }
                      if (targetProject) {
                        setValue(GeneralFormFieldId.TargetProject, '', { shouldValidate: true });
                      }
                    }}
                    onClearSelection={() => field.onChange('')}
                    toggleProps={{
                      status: errors[GeneralFormFieldId.PlanProject] && MenuToggleStatus.danger,
                    }}
                  />
                </div>
              ),
            }}
          />
        </FormSection>

        <FormSection title={t('Source and target providers')} titleElement="h3">
          <p>
            {t(
              'Select the provider you would like to migrate your virtual machines from (source provider) and the provider you want to migrate your virtual machines to (target provider).',
            )}
          </p>

          <ControlledFormGroup
            isRequired
            fieldId={GeneralFormFieldId.SourceProvider}
            label={generalFormFieldLabels[GeneralFormFieldId.SourceProvider]}
            controller={{
              rules: { required: t('Source provider is required.') },
              render: ({ field }) => (
                <ProviderSelect
                  placeholder={t('Select source provider')}
                  id={GeneralFormFieldId.SourceProvider}
                  namespace={providerNamespace}
                  value={(field.value as V1beta1Provider)?.metadata?.name || ''}
                  onSelect={(_, value) => field.onChange(value)}
                  status={errors[GeneralFormFieldId.SourceProvider] && MenuToggleStatus.danger}
                />
              ),
            }}
          />

          <ControlledFormGroup
            isRequired
            fieldId={GeneralFormFieldId.TargetProvider}
            label={generalFormFieldLabels[GeneralFormFieldId.TargetProvider]}
            controller={{
              rules: { required: t('Target provider is required.') },
              render: ({ field }) => (
                <ProviderSelect
                  placeholder={t('Select target provider')}
                  id={GeneralFormFieldId.TargetProvider}
                  namespace={providerNamespace}
                  value={(field.value as V1beta1Provider)?.metadata?.name || ''}
                  onSelect={(_, value) => {
                    field.onChange(value);

                    if (targetProject) {
                      setValue(GeneralFormFieldId.TargetProject, '', { shouldValidate: true });
                    }
                  }}
                  status={errors[GeneralFormFieldId.TargetProvider] && MenuToggleStatus.danger}
                />
              ),
            }}
          />

          <ControlledFormGroup
            isRequired
            fieldId={GeneralFormFieldId.TargetProject}
            label={generalFormFieldLabels[GeneralFormFieldId.TargetProject]}
            controller={{
              rules: { required: t('Target project is required.') },
              render: ({ field }) => (
                <div ref={field.ref}>
                  <TypeaheadSelect
                    isScrollable
                    placeholder={
                      targetProviderProjectsLoading ? t('Loading...') : t('Select target project')
                    }
                    id={GeneralFormFieldId.TargetProject}
                    selectOptions={targetProviderProjects.map((project) => ({
                      value: project.name,
                      content: project.name,
                    }))}
                    isDisabled={targetProviderProjectsLoading}
                    selected={field.value}
                    onSelect={(_, value) => field.onChange(value)}
                    onClearSelection={() => field.onChange('')}
                    {...(!targetProvider && {
                      noOptionsAvailableMessage: t(
                        'Select a target provider to list available target projects',
                      ),
                    })}
                    toggleProps={{
                      status: errors[GeneralFormFieldId.TargetProject] && MenuToggleStatus.danger,
                    }}
                  />
                </div>
              ),
            }}
          />
        </FormSection>
      </Form>
    </WizardStepContainer>
  );
};

export default GeneralInformationStep;
