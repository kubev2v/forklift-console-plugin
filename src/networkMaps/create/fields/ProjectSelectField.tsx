import { type FC, useEffect, useState } from 'react';
import {
  Controller,
  type FieldPath,
  type FieldValues,
  useFormContext,
  useWatch,
} from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import ProjectSelect from '@components/common/ProjectSelect/ProjectSelect.tsx';
import { MenuToggleStatus, Stack, StackItem } from '@patternfly/react-core';
import { useDefaultProject } from '@utils/hooks/useDefaultProject';
import useWatchProjectNames from '@utils/hooks/useWatchProjectNames.ts';
import { useForkliftTranslation } from '@utils/i18n';
import { isSystemNamespace } from '@utils/namespaces.ts';

import { NetworkMapFieldId, networkMapFieldLabels } from '../../constants';
import type { CreateNetworkMapFormData } from '../types';

const ProjectSelectField: FC = () => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { errors, isSubmitting },
    setValue,
  } = useFormContext<CreateNetworkMapFormData>();
  const [targetProvider, sourceProvider] = useWatch({
    control,
    name: [NetworkMapFieldId.TargetProvider, NetworkMapFieldId.SourceProvider],
  });
  const [projectNames] = useWatchProjectNames();

  const defaultProject = useDefaultProject(projectNames);
  const [showDefaultProjects, setShowDefaultProjects] = useState<boolean>(false);

  // Automatically set the default project once it's resolved
  useEffect(() => {
    if (defaultProject) {
      setValue(NetworkMapFieldId.Project, defaultProject);
      setShowDefaultProjects((prev) => prev || isSystemNamespace(defaultProject));
    }
  }, [defaultProject, setValue]);

  return (
    <FormGroupWithErrorText
      isRequired
      fieldId={NetworkMapFieldId.Project}
      label={networkMapFieldLabels[NetworkMapFieldId.Project]}
      labelIcon={
        <HelpIconPopover>
          <Stack hasGutter>
            <StackItem>{t('The project that your network map will be created in.')}</StackItem>
            <StackItem>
              {t('Projects, also known as namespaces, separate resources within clusters.')}
            </StackItem>
          </Stack>
        </HelpIconPopover>
      }
    >
      <Controller
        name={NetworkMapFieldId.Project}
        control={control}
        render={({ field }) => (
          <div ref={field.ref}>
            <ProjectSelect
              showDefaultProjects={showDefaultProjects}
              setShowDefaultProjects={setShowDefaultProjects}
              isDisabled={isSubmitting}
              placeholder={t('Select project')}
              id={NetworkMapFieldId.Project}
              testId="network-map-project-select"
              projectNames={projectNames}
              value={field.value}
              onChange={(value) => {
                field.onChange(value);

                if (sourceProvider) {
                  setValue<FieldPath<FieldValues>>(NetworkMapFieldId.SourceProvider, '', {
                    shouldValidate: true,
                  });
                }
                if (targetProvider) {
                  setValue<FieldPath<FieldValues>>(NetworkMapFieldId.TargetProvider, '', {
                    shouldValidate: true,
                  });
                }
              }}
              toggleProps={{
                status: errors[NetworkMapFieldId.Project] && MenuToggleStatus.danger,
              }}
            />
          </div>
        )}
        rules={{ required: t('Project is required.') }}
      />
    </FormGroupWithErrorText>
  );
};

export default ProjectSelectField;
