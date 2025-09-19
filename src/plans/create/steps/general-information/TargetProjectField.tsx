import { type FC, useMemo } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { useNamespaces as useProviderNamespaces } from 'src/modules/Providers/hooks/useNamespaces';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import ProjectSelect from '@components/common/ProjectSelect/ProjectSelect.tsx';
import { MenuToggleStatus, Stack, StackItem } from '@patternfly/react-core';
import { getName } from '@utils/crds/common/selectors.ts';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { GeneralFormFieldId, generalFormFieldLabels } from './constants';

type TargetProjectFieldProps = {
  testId?: string;
};

const TargetProjectField: FC<TargetProjectFieldProps> = ({ testId = 'target-project-select' }) => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { errors },
    setValue,
  } = useCreatePlanFormContext();
  const targetProvider = useWatch({
    control,
    name: GeneralFormFieldId.TargetProvider,
  });
  const targetProviderName = getName(targetProvider);
  const [targetProviderProjects, , , forceRefresh] = useProviderNamespaces(targetProvider);
  const showDefaultProjects =
    useWatch({ control, name: GeneralFormFieldId.ShowDefaultProjects }) ?? false;

  const targetProjectNames = useMemo(
    () => targetProviderProjects.map((project) => project.name),
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
          <ProjectSelect
            testId={testId}
            isDisabled={!targetProvider}
            placeholder={
              targetProvider
                ? t('Select target project')
                : t('Must choose a target provider to see available target projects')
            }
            id={GeneralFormFieldId.TargetProject}
            projectNames={targetProjectNames}
            emptyStateMessage={
              targetProviderName ? (
                <ForkliftTrans>
                  Target provider <strong>{targetProviderName}</strong> does not have network
                  mappings available in any existing projects.
                  <br />
                  Create a project or select a different target provider.
                </ForkliftTrans>
              ) : null
            }
            value={field.value}
            onChange={field.onChange}
            onNewValue={(newProjectName) => {
              forceRefresh();
              setValue(GeneralFormFieldId.TargetProject, newProjectName);
            }}
            showDefaultProjects={Boolean(showDefaultProjects)}
            setShowDefaultProjects={(value) => {
              setValue(GeneralFormFieldId.ShowDefaultProjects, value);
            }}
            noOptionsMessage={
              targetProvider
                ? undefined
                : t('Select a target provider to list available target projects')
            }
            toggleProps={{
              id: 'target-project-select',
              status: errors[GeneralFormFieldId.TargetProject] && MenuToggleStatus.danger,
            }}
          />
        )}
        rules={{ required: t('Target project is required.') }}
      />
    </FormGroupWithErrorText>
  );
};

export default TargetProjectField;
