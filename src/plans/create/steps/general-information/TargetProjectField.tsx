import { type FC, useMemo } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { useNamespaces as useProviderNamespaces } from 'src/modules/Providers/hooks/useNamespaces';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { TypeaheadSelect } from '@components/common/TypeaheadSelect/TypeaheadSelect';
import { MenuToggleStatus, Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { GeneralFormFieldId, generalFormFieldLabels } from './constants';

const TargetProjectField: FC = () => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { errors },
  } = useCreatePlanFormContext();
  const targetProvider = useWatch({ control, name: GeneralFormFieldId.TargetProvider });
  const [targetProviderProjects] = useProviderNamespaces(targetProvider);

  const targetProviderOptions = useMemo(
    () =>
      targetProviderProjects.map((project) => ({
        content: project.name,
        value: project.name,
      })),
    [targetProviderProjects],
  );

  return (
    <FormGroupWithErrorText
      isRequired
      fieldId={GeneralFormFieldId.TargetProject}
      label={generalFormFieldLabels[GeneralFormFieldId.TargetProject]}
      labelIcon={
        <HelpIconPopover>
          <Stack hasGutter>
            <StackItem>
              {t(
                'The target project is the project, within your selected target provider, that your virtual machines will be migrated to. This is different from the project that your migration plan will be created in and where your provider was created.',
              )}
            </StackItem>
            <StackItem>
              {t('Projects, also known as namespaces, separate resources within clusters.')}
            </StackItem>
          </Stack>
        </HelpIconPopover>
      }
    >
      <Controller
        name={GeneralFormFieldId.TargetProject}
        control={control}
        render={({ field }) => (
          <div ref={field.ref}>
            <TypeaheadSelect
              isScrollable
              placeholder={t('Select target project')}
              id={GeneralFormFieldId.TargetProject}
              selectOptions={targetProviderOptions}
              selected={field.value}
              onSelect={(_event, value) => {
                field.onChange(value);
              }}
              onClearSelection={() => {
                field.onChange('');
              }}
              noOptionsAvailableMessage={
                targetProvider
                  ? undefined
                  : t('Select a target provider to list available target projects')
              }
              toggleProps={{
                status: errors[GeneralFormFieldId.TargetProject] && MenuToggleStatus.danger,
              }}
            />
          </div>
        )}
        rules={{ required: t('Target project is required.') }}
      />
    </FormGroupWithErrorText>
  );
};

export default TargetProjectField;
