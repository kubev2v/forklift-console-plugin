import { type FC, useEffect } from 'react';
import {
  Controller,
  type FieldPath,
  type FieldValues,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import useProjectNameSelectOptions from 'src/providers/create/hooks/useProjectNameSelectOptions';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import TypeaheadSelect from '@components/common/TypeaheadSelect/TypeaheadSelect';
import { MenuToggleStatus, Stack, StackItem } from '@patternfly/react-core';
import { useDefaultProject } from '@utils/hooks/useDefaultProject';
import { useForkliftTranslation } from '@utils/i18n';

import { StorageMapFieldId, storageMapFieldLabels } from '../../constants';
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
  const [projectOptions] = useProjectNameSelectOptions();
  const defaultProject = useDefaultProject(projectOptions);

  // Automatically set the default project once it's resolved
  useEffect(() => {
    if (defaultProject) {
      setValue(StorageMapFieldId.Project, defaultProject);
    }
  }, [defaultProject, setValue]);

  return (
    <FormGroupWithErrorText
      isRequired
      fieldId={StorageMapFieldId.Project}
      label={storageMapFieldLabels[StorageMapFieldId.Project]}
      labelIcon={
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
        name={StorageMapFieldId.Project}
        control={control}
        render={({ field }) => (
          <div ref={field.ref}>
            <TypeaheadSelect
              isScrollable
              allowClear
              isDisabled={isSubmitting}
              placeholder={t('Select project')}
              id={StorageMapFieldId.Project}
              testId="project-select"
              options={projectOptions}
              value={field.value}
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
              toggleProps={{
                status: errors[StorageMapFieldId.Project] && MenuToggleStatus.danger,
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
