import { type FC, useEffect, useRef } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import ProjectSelect from '@components/common/ProjectSelect/ProjectSelect';
import { MenuToggleStatus, Stack, StackItem } from '@patternfly/react-core';
import { useDefaultProject } from '@utils/hooks/useDefaultProject';
import useWatchProjectNames from '@utils/hooks/useWatchProjectNames';
import { useForkliftTranslation } from '@utils/i18n';
import { isSystemNamespace } from '@utils/namespaces';

import { useCreateProviderFormContext } from '../hooks/useCreateProviderFormContext';

import { ProviderFormFieldId, providerFormFieldLabels } from './constants';

const ProviderProjectField: FC = () => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { errors },
    setValue,
  } = useCreateProviderFormContext();

  const [projectNames] = useWatchProjectNames();

  const defaultProject = useDefaultProject(projectNames);
  const hasSetInitialDefault = useRef(false);

  const showDefaultProjects = useWatch({
    control,
    name: ProviderFormFieldId.ShowDefaultProjects,
  });

  // Set initial default project
  useEffect(() => {
    if (defaultProject && !hasSetInitialDefault.current) {
      setValue(ProviderFormFieldId.ProviderProject, defaultProject);
      setValue(ProviderFormFieldId.ShowDefaultProjects, isSystemNamespace(defaultProject));

      hasSetInitialDefault.current = true;
    }
  }, [defaultProject, setValue]);

  return (
    <FormGroupWithErrorText
      isRequired
      fieldId={ProviderFormFieldId.ProviderProject}
      label={providerFormFieldLabels[ProviderFormFieldId.ProviderProject]}
      labelHelp={
        <HelpIconPopover>
          <Stack hasGutter>
            <StackItem>
              {t(
                'The project that your provider will be created in. This determines where the provider credentials and configuration will be stored.',
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
        name={ProviderFormFieldId.ProviderProject}
        control={control}
        render={({ field }) => (
          <ProjectSelect
            testId="provider-project-select"
            showDefaultProjects={showDefaultProjects ?? false}
            setShowDefaultProjects={(value) => {
              setValue(ProviderFormFieldId.ShowDefaultProjects, value);
            }}
            placeholder={t('Select provider project')}
            id={ProviderFormFieldId.ProviderProject}
            projectNames={projectNames}
            value={field.value}
            onChange={field.onChange}
            toggleProps={{
              id: 'provider-project-select',
              status: errors[ProviderFormFieldId.ProviderProject] && MenuToggleStatus.danger,
            }}
          />
        )}
        rules={{ required: t('Provider project is required.') }}
      />
    </FormGroupWithErrorText>
  );
};

export default ProviderProjectField;
