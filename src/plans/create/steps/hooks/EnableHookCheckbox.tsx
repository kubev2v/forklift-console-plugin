import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import { Checkbox } from '@patternfly/react-core';

import { useCreatePlanFormContext } from '../../hooks';

import { type HooksFormFieldId, MigrationHookFieldId } from './constants';
import { getHooksFormFieldLabels, getHooksSubFieldId } from './utils';

type EnableHookCheckboxProps = {
  fieldId: HooksFormFieldId;
};

const EnableHookCheckbox: FC<EnableHookCheckboxProps> = ({ fieldId }) => {
  const { control, unregister } = useCreatePlanFormContext();
  const subFieldId = getHooksSubFieldId(fieldId, MigrationHookFieldId.EnableHook);

  return (
    <Controller
      name={subFieldId}
      control={control}
      render={({ field }) => (
        <Checkbox
          id={subFieldId}
          label={getHooksFormFieldLabels(fieldId)[MigrationHookFieldId.EnableHook]}
          isChecked={field.value}
          onChange={(_, value) => {
            field.onChange(value);

            if (!value) {
              unregister([
                getHooksSubFieldId(fieldId, MigrationHookFieldId.HookRunnerImage),
                getHooksSubFieldId(fieldId, MigrationHookFieldId.AnsiblePlaybook),
              ]);
            }
          }}
        />
      )}
    />
  );
};

export default EnableHookCheckbox;
