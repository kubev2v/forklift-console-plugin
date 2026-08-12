import { type FC, useEffect, useState } from 'react';
import {
  Controller,
  type FieldPath,
  type FieldValues,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { storageMapFieldLabels } from 'src/storageMaps/utils/constants';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import ProjectSelect from '@components/common/ProjectSelect/ProjectSelect';
import { MenuToggleStatus, Stack, StackItem } from '@patternfly/react-core';
import { useDefaultProject } from '@utils/hooks/useDefaultProject';
import useWatchProjectNames from '@utils/hooks/useWatchProjectNames';
import { useForkliftTranslation } from '@utils/i18n';
import { isSystemNamespace } from '@utils/namespaces';
import { StorageMapFieldId } from '@utils/storage/types';

import type { CreateStorageMapFormData } from '../types';

const ProjectSelectField: FC = () => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { errors, isSubmitting },
    setValue,
  } = useFormContext<CreateStorageMapFormData>();
  const [targetProvider, sourceProvider] = useWatch({
    control,
    name: [StorageMapFieldId.TargetProvider, StorageMapFieldId.SourceProvider],
  });
  const [projectNames] = useWatchProjectNames();

  const defaultProject = useDefaultProject(projectNames);
  const [showDefaultProjects, setShowDefaultProjects] = useState<boolean>(false);
  const effectiveShowDefaultProjects =
    showDefaultProjects || Boolean(defaultProject && isSystemNamespace(defaultProject));

  // Automatically set the default project once it's resolved
  useEffect(() => {
    if (defaultProject) {
      setValue(StorageMapFieldId.Project, defaultProject);
    }
  }, [defaultProject, setValue]);

  return (
    <FormGroupWithErrorText
      fieldId={StorageMapFieldId.Project}
      isRequired
      label={storageMapFieldLabels[StorageMapFieldId.Project]}
      labelHelp={
        <HelpIconPopover>
          <Stack hasGutter>
            <StackItem>{t('The project that your storage map will be created in.')}</StackItem>
            <StackItem>
              {t('Projects, also known as namespaces, separate resources within clusters.')}
            </StackItem>
          </Stack>
        </HelpIconPopover>
      }
    >
      <Controller
        control={control}
        name={StorageMapFieldId.Project}
        render={({ field }) => (
          <div ref={field.ref}>
            <ProjectSelect
              id={StorageMapFieldId.Project}
              isDisabled={isSubmitting}
              onChange={(value) => {
                field.onChange(value);

                if (sourceProvider) {
                  setValue<FieldPath<FieldValues>>(StorageMapFieldId.SourceProvider, '', {
                    shouldValidate: true,
                  });
                }
                if (targetProvider) {
                  setValue<FieldPath<FieldValues>>(StorageMapFieldId.TargetProvider, '', {
                    shouldValidate: true,
                  });
                }
              }}
              placeholder={t('Select project')}
              projectNames={projectNames}
              setShowDefaultProjects={setShowDefaultProjects}
              showDefaultProjects={effectiveShowDefaultProjects}
              testId="project-select"
              toggleProps={{
                status: errors[StorageMapFieldId.Project] && MenuToggleStatus.danger,
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
