import type { FC } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { getServiceAccountHelperText } from 'src/plans/details/tabs/Hooks/utils/utils';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { HooksFormFieldId, MigrationHookFieldId } from './constants';
import { getHooksSubFieldId, hooksFormFieldLabels, validateHookServiceAccount } from './utils';

type HookServiceAccountFieldProps = {
  fieldId: HooksFormFieldId;
};

const HookServiceAccountField: FC<HookServiceAccountFieldProps> = ({ fieldId }) => {
  useForkliftTranslation();
  const { control, getFieldState } = useCreatePlanFormContext();

  const enableHookFieldId = getHooksSubFieldId(fieldId, MigrationHookFieldId.EnableHook);

  const isHookEnabled = useWatch({
    control,
    name: enableHookFieldId,
  });

  if (!isHookEnabled) {
    return null;
  }

  const hookServiceAccountFieldId = getHooksSubFieldId(
    fieldId,
    MigrationHookFieldId.ServiceAccount,
  );
  const { error } = getFieldState(hookServiceAccountFieldId);

  return (
    <FormGroupWithErrorText
      fieldId={hookServiceAccountFieldId}
      label={hooksFormFieldLabels[MigrationHookFieldId.ServiceAccount]}
    >
      <Controller
        control={control}
        name={hookServiceAccountFieldId}
        render={({ field }) => (
          <>
            <TextInput
              {...field}
              aria-describedby={`${hookServiceAccountFieldId}-helper`}
              data-testid={`${hookServiceAccountFieldId}-input`}
              id={hookServiceAccountFieldId}
              name={hookServiceAccountFieldId}
              validated={getInputValidated(error)}
            />
            <FormGroupWithHelpText
              helperText={getServiceAccountHelperText(fieldId === HooksFormFieldId.PreMigration)}
            />
          </>
        )}
        rules={{
          validate: validateHookServiceAccount,
        }}
      />
    </FormGroupWithErrorText>
  );
};

export default HookServiceAccountField;
