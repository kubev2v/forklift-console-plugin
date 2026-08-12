import { type Dispatch, type FC, type FormEvent, type SetStateAction, useEffect } from 'react';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { WEIGHT_FIELD_HELP_TEXT } from './utils/constants';
import type { AffinityRowData } from './utils/types';

type PreferredAffinityWeightInputProps = {
  focusedAffinity: AffinityRowData;
  setFocusedAffinity: Dispatch<SetStateAction<AffinityRowData>>;
  setSubmitDisabled: Dispatch<SetStateAction<boolean>>;
};

const PreferredAffinityWeightInput: FC<PreferredAffinityWeightInputProps> = ({
  focusedAffinity,
  setFocusedAffinity,
  setSubmitDisabled,
}) => {
  const { t } = useForkliftTranslation();
  const { weight } = focusedAffinity || {};
  const isInvalid = !weight || weight < 1 || weight > 100;
  const validated = isInvalid ? ValidatedOptions.error : ValidatedOptions.default;

  const onChange = (_event: FormEvent<HTMLInputElement>, value: string) => {
    setFocusedAffinity({ ...focusedAffinity, weight: Number(value) });
  };

  useEffect(() => {
    setSubmitDisabled(isInvalid);
  }, [isInvalid, setSubmitDisabled]);

  return (
    <FormGroup fieldId="weight" isRequired label={t('Weight')}>
      <TextInput
        data-testid="affinity-weight-input"
        onChange={(_event, value: string) => {
          onChange(_event, value);
        }}
        type="text"
        validated={validated}
        value={weight}
      />

      <FormGroupWithHelpText
        helperText={WEIGHT_FIELD_HELP_TEXT}
        helperTextInvalid={WEIGHT_FIELD_HELP_TEXT}
        isRequired
        validated={validated}
      />
    </FormGroup>
  );
};

export default PreferredAffinityWeightInput;
