import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import { FormGroup, FormHelperText, TextInput } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { type HooksFormFieldId, MigrationHookFieldId } from './constants';
import { getHooksSubFieldId, hooksFormFieldLabels } from './utils';

type HookRunnerImageFieldProps = {
  fieldId: HooksFormFieldId;
};

const HookRunnerImageField: FC<HookRunnerImageFieldProps> = ({ fieldId }) => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();
  const subFieldId = getHooksSubFieldId(fieldId, MigrationHookFieldId.HookRunnerImage);

  return (
    <FormGroup
      fieldId={subFieldId}
      label={hooksFormFieldLabels[MigrationHookFieldId.HookRunnerImage]}
    >
      <Controller
        name={subFieldId}
        control={control}
        render={({ field }) => <TextInput {...field} />}
      />

      <FormHelperText>
        {t(
          'You can use a custom hook-runner image or specify a custom image, for example quay.io/konveyor/hook-runner.',
        )}
      </FormHelperText>
    </FormGroup>
  );
};

export default HookRunnerImageField;
