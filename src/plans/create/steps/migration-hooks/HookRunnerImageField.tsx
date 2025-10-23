import type { FC } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { type HooksFormFieldId, MigrationHookFieldId } from './constants';
import { getHooksSubFieldId, hooksFormFieldLabels, validateHookRunnerImage } from './utils';

type HookRunnerImageFieldProps = {
  fieldId: HooksFormFieldId;
};

const HookRunnerImageField: FC<HookRunnerImageFieldProps> = ({ fieldId }) => {
  const { t } = useForkliftTranslation();
  const { control, getFieldState } = useCreatePlanFormContext();

  const enableHookFieldId = getHooksSubFieldId(fieldId, MigrationHookFieldId.EnableHook);
  const hookRunnerImageFieldId = getHooksSubFieldId(fieldId, MigrationHookFieldId.HookRunnerImage);
  const { error } = getFieldState(hookRunnerImageFieldId);

  const isHookEnabled = useWatch({
    control,
    name: enableHookFieldId,
  });

  if (!isHookEnabled) {
    return null;
  }

  return (
    <FormGroupWithErrorText
      label={hooksFormFieldLabels[MigrationHookFieldId.HookRunnerImage]}
      isRequired
      fieldId={hookRunnerImageFieldId}
    >
      <Controller
        control={control}
        name={hookRunnerImageFieldId}
        rules={{
          validate: (value: string) => validateHookRunnerImage(value, t),
        }}
        render={({ field }) => (
          <>
            <TextInput
              {...field}
              id={hookRunnerImageFieldId}
              aria-describedby={`${hookRunnerImageFieldId}-helper`}
              name={hookRunnerImageFieldId}
              validated={getInputValidated(Boolean(error))}
            />
            <FormGroupWithHelpText
              helperText={t(
                'You can use a custom hook-runner image or specify a custom image, for example quay.io/konveyor/hook-runner.',
              )}
            />
          </>
        )}
      />
    </FormGroupWithErrorText>
  );
};

export default HookRunnerImageField;
