import React from 'react';
import { Validation } from 'src/modules/Providers';
import { useForkliftTranslation } from 'src/utils';

import { FormGroupWithHelpText } from '@kubev2v/common';
import { TextInput } from '@patternfly/react-core';

import { getInvalidHelperText } from './utils/utils';

interface PlanNameTextFieldProps {
  value: string;
  validated: Validation;
  onChange: (event: React.FormEvent<HTMLInputElement>, value: string) => void;
  isRequired?: boolean;
  isDisabled?: boolean;
}

export const PlanNameTextField: React.FC<PlanNameTextFieldProps> = ({
  value,
  validated,
  isDisabled,
  isRequired,
  onChange,
}) => {
  const { t } = useForkliftTranslation();
  const [isUpdated, setIsUpdated] = React.useState(false);

  return (
    <FormGroupWithHelpText
      label={t('Plan name')}
      isRequired={isRequired}
      fieldId="planName"
      {...(isUpdated && {
        validated: validated,
        helperTextInvalid: getInvalidHelperText(validated, value),
      })}
    >
      <TextInput
        spellCheck="false"
        isRequired={isRequired}
        type="text"
        id="planName"
        value={value}
        validated={isUpdated ? validated : 'default'}
        isDisabled={isDisabled}
        onChange={(event, value) => {
          onChange(event, value);
          setIsUpdated(true);
        }}
      />
    </FormGroupWithHelpText>
  );
};
