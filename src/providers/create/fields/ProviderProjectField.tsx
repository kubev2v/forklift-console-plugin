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
      fieldId={ProviderFormFieldId.ProviderProject}
      isRequired
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
        control={control}
        name={ProviderFormFieldId.ProviderProject}
        render={({ field }) => (
          <ProjectSelect
            id={ProviderFormFieldId.ProviderProject}
            onChange={field.onChange}
            placeholder={t('Select provider project')}
            projectNames={projectNames}
            setShowDefaultProjects={(value) => {
              setValue(ProviderFormFieldId.ShowDefaultProjects, value);
            }}
            showDefaultProjects={showDefaultProjects ?? false}
            testId="provider-project-select"
            toggleProps={{
              id: 'provider-project-select',
              status: errors[ProviderFormFieldId.ProviderProject] && MenuToggleStatus.danger,
            }}
            value={field.value}
          />
        )}
        rules={{ required: t('Provider project is required.') }}
      />
    </FormGroupWithErrorText>
  );
};

export default ProviderProjectField;
