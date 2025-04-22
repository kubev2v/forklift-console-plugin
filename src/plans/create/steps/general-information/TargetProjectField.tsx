import { type FC, useMemo } from 'react';
import { useNamespaces as useProviderNamespaces } from 'src/modules/Providers/hooks/useNamespaces';

import ControlledFormGroup from '@components/common/ControlledFormGroup';
import { TypeaheadSelect } from '@components/common/TypeaheadSelect/TypeaheadSelect';
import { MenuToggleStatus } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFieldWatch, useCreatePlanFormContext } from '../../hooks';

import { GeneralFormFieldId, generalFormFieldLabels } from './constants';

export const TargetProjectField: FC = () => {
  const { t } = useForkliftTranslation();
  const {
    formState: { errors },
  } = useCreatePlanFormContext();
  const targetProvider = useCreatePlanFieldWatch(GeneralFormFieldId.TargetProvider);
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
    <ControlledFormGroup
      isRequired
      fieldId={GeneralFormFieldId.TargetProject}
      label={generalFormFieldLabels[GeneralFormFieldId.TargetProject]}
      controller={{
        render: ({ field }) => (
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
        ),
        rules: { required: t('Target project is required.') },
      }}
    />
  );
};
