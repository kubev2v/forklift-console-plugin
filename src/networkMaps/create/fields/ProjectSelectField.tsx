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
import ProjectSelect from '@components/common/ProjectSelect/ProjectSelect';
import { MenuToggleStatus, Stack, StackItem } from '@patternfly/react-core';
import { NetworkMapFieldId } from '@utils/crds/maps/types';
import { useDefaultProject } from '@utils/hooks/useDefaultProject';
import useWatchProjectNames from '@utils/hooks/useWatchProjectNames';
import { useForkliftTranslation } from '@utils/i18n';
import { isSystemNamespace } from '@utils/namespaces';

import { networkMapFieldLabels } from '../../utils/constants';
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
  const effectiveShowDefaultProjects =
    showDefaultProjects || Boolean(defaultProject && isSystemNamespace(defaultProject));

  // Automatically set the default project once it's resolved
  useEffect(() => {
    if (defaultProject) {
      setValue(NetworkMapFieldId.Project, defaultProject);
    }
  }, [defaultProject, setValue]);

  return (
    <FormGroupWithErrorText
      fieldId={NetworkMapFieldId.Project}
      isRequired
      label={networkMapFieldLabels[NetworkMapFieldId.Project]}
      labelHelp={
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
        control={control}
        name={NetworkMapFieldId.Project}
        render={({ field }) => (
          <div ref={field.ref}>
            <ProjectSelect
              id={NetworkMapFieldId.Project}
              isDisabled={isSubmitting}
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
              placeholder={t('Select project')}
              projectNames={projectNames}
              setShowDefaultProjects={setShowDefaultProjects}
              showDefaultProjects={effectiveShowDefaultProjects}
              testId="network-map-project-select"
              toggleProps={{
                status: errors[NetworkMapFieldId.Project] && MenuToggleStatus.danger,
              }}
              value={field.value}
            />
          </div>
        )}
        rules={{ required: t('Project is required.') }}
      />
    </FormGroupWithErrorText>
  );
};

export default ProjectSelectField;
