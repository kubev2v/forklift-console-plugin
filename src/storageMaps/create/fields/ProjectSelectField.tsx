import { type FC, useEffect } from 'react';
import {
  Controller,
  type FieldPath,
  type FieldValues,
  useFormContext,
  useWatch,
} from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { useProjectNameSelectOptions } from '@components/common/ProjectNameSelect';
import { TypeaheadSelect } from '@components/common/TypeaheadSelect/TypeaheadSelect';
import { MenuToggleStatus, Stack, StackItem } from '@patternfly/react-core';
import { useDefaultProject } from '@utils/hooks/useDefaultProject';
import { useForkliftTranslation } from '@utils/i18n';

import type { CreateStorageMapFormData } from '../types';

import { CreateStorageMapFieldId, createStorageMapFieldLabels } from './constants';

const ProjectSelectField: FC = () => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { errors, isSubmitting },
    setValue,
  } = useFormContext<CreateStorageMapFormData>();
  const [targetProvider, sourceProvider] = useWatch({
    control,
    name: [CreateStorageMapFieldId.TargetProvider, CreateStorageMapFieldId.SourceProvider],
  });
  const [projectOptions] = useProjectNameSelectOptions();
  const defaultProject = useDefaultProject(projectOptions);

  // Automatically set the default project once it's resolved
  useEffect(() => {
    if (defaultProject) {
      setValue(CreateStorageMapFieldId.Project, defaultProject);
    }
  }, [defaultProject, setValue]);

  return (
    <FormGroupWithErrorText
      isRequired
      fieldId={CreateStorageMapFieldId.Project}
      label={createStorageMapFieldLabels[CreateStorageMapFieldId.Project]}
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
        name={CreateStorageMapFieldId.Project}
        control={control}
        render={({ field }) => (
          <div ref={field.ref}>
            <TypeaheadSelect
              isScrollable
              isDisabled={isSubmitting}
              placeholder={t('Select project')}
              id={CreateStorageMapFieldId.Project}
              selectOptions={projectOptions}
              selected={field.value}
              onSelect={(_, value) => {
                field.onChange(value);

                if (sourceProvider) {
                  setValue<FieldPath<FieldValues>>(CreateStorageMapFieldId.SourceProvider, '', {
                    shouldValidate: true,
                  });
                }
                if (targetProvider) {
                  setValue<FieldPath<FieldValues>>(CreateStorageMapFieldId.TargetProvider, '', {
                    shouldValidate: true,
                  });
                }
              }}
              onClearSelection={() => {
                field.onChange('');
              }}
              toggleProps={{
                status: errors[CreateStorageMapFieldId.Project] && MenuToggleStatus.danger,
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
