import { type FC, useMemo, useRef } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { useNamespaces as useProviderNamespaces } from 'src/modules/Providers/hooks/useNamespaces';
import { isSystemNamespace } from 'src/utils/namespaces';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import TypeaheadSelect from '@components/common/TypeaheadSelect/TypeaheadSelect';
import { Divider, MenuToggleStatus, Stack, StackItem, Switch } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

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
  } = useCreatePlanFormContext();
  const targetProvider = useWatch({ control, name: GeneralFormFieldId.TargetProvider });
  const [targetProviderProjects] = useProviderNamespaces(targetProvider);
  const showDefaultProjects =
    useWatch({ control, name: GeneralFormFieldId.ShowDefaultProjects }) ?? false;
  const inputRef = useRef<HTMLInputElement | null>(null);

  const targetProviderOptions = useMemo(
    () =>
      targetProviderProjects.map((project) => ({
        content: project.name,
        value: project.name,
      })),
    [targetProviderProjects],
  );

  const filteredTargetProviderOptions = useMemo(() => {
    if (!showDefaultProjects) {
      return targetProviderOptions.filter(
        (option) => typeof option.content === 'string' && !isSystemNamespace(option.content),
      );
    }
    return targetProviderOptions;
  }, [targetProviderOptions, showDefaultProjects]);

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
          <TypeaheadSelect
            ref={(element) => {
              field.ref(element);
              inputRef.current = element;
            }}
            testId={testId}
            isScrollable
            allowClear
            placeholder={t('Select target project')}
            id={GeneralFormFieldId.TargetProject}
            options={filteredTargetProviderOptions}
            value={field.value}
            onChange={field.onChange}
            noOptionsMessage={
              targetProvider
                ? undefined
                : t('Select a target provider to list available target projects')
            }
            toggleProps={{
              id: 'target-project-select',
              status: errors[GeneralFormFieldId.TargetProject] && MenuToggleStatus.danger,
            }}
            filterControls={
              <>
                <div className="pf-v5-u-px-md pf-v5-u-py-md">
                  <Controller
                    name={GeneralFormFieldId.ShowDefaultProjects}
                    control={control}
                    render={({ field: switchField }) => (
                      <Switch
                        id="show-default-projects-switch"
                        data-testid="show-default-projects-switch"
                        label={generalFormFieldLabels[GeneralFormFieldId.ShowDefaultProjects]}
                        isChecked={switchField.value}
                        onChange={(_event, checked) => {
                          switchField.onChange(checked);
                          setTimeout(() => inputRef.current?.focus(), 0);
                        }}
                      />
                    )}
                  />
                </div>
                <Divider />
              </>
            }
          />
        )}
        rules={{ required: t('Target project is required.') }}
      />
    </FormGroupWithErrorText>
  );
};

export default TargetProjectField;
