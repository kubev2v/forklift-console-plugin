import type { FC } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { isProviderLocalOpenshift } from '@utils/resources';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { GeneralFormFieldId, generalFormFieldLabels } from './constants';
import LocalProviderTargetProjectSelect from './LocalProviderTargetProjectSelect';
import RemoteProviderTargetProjectSelect from './RemoteProviderTargetProjectSelect';

type TargetProjectFieldProps = {
  testId?: string;
};

const TargetProjectField: FC<TargetProjectFieldProps> = ({ testId = 'target-project-select' }) => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();
  const targetProvider = useWatch({
    control,
    name: GeneralFormFieldId.TargetProvider,
  });

  const isLocalProvider = isProviderLocalOpenshift(targetProvider);

  return (
    <FormGroupWithErrorText
      isRequired
      fieldId={GeneralFormFieldId.TargetProject}
      label={generalFormFieldLabels[GeneralFormFieldId.TargetProject]}
      labelHelp={
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
        render={({ field }) =>
          isLocalProvider ? (
            <LocalProviderTargetProjectSelect field={field} testId={testId} />
          ) : (
            <RemoteProviderTargetProjectSelect
              field={field}
              targetProvider={targetProvider}
              testId={testId}
            />
          )
        }
        rules={{ required: t('Target project is required.') }}
      />
    </FormGroupWithErrorText>
  );
};

export default TargetProjectField;
