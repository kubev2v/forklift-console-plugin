import { type FC, type FormEvent, useState } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import type { Validation } from 'src/modules/Providers/utils/types/Validation';
import { useForkliftTranslation } from 'src/utils/i18n';

import { TextInput } from '@patternfly/react-core';

import { getInvalidHelperText } from './utils/utils';

type PlanNameTextFieldProps = {
  value: string;
  validated: Validation;
  onChange: (event: FormEvent<HTMLInputElement>, value: string) => void;
  isRequired?: boolean;
  isDisabled?: boolean;
};

export const PlanNameTextField: FC<PlanNameTextFieldProps> = ({
  isDisabled,
  isRequired,
  onChange,
  validated,
  value,
}) => {
  const { t } = useForkliftTranslation();
  const [isUpdated, setIsUpdated] = useState(false);

  return (
    <FormGroupWithHelpText
      label={t('Plan name')}
      isRequired={isRequired}
      fieldId="planName"
      {...(isUpdated && {
        helperTextInvalid: getInvalidHelperText(validated, value),
        validated,
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
