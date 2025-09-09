import {
  type Dispatch,
  type FC,
  type FormEvent,
  type SetStateAction,
  useEffect,
  useState,
} from 'react';

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
  const [validated, setValidated] = useState<ValidatedOptions>(ValidatedOptions.default);
  const { weight } = focusedAffinity || {};

  const onChange = (_event: FormEvent<HTMLInputElement>, value: string) => {
    setFocusedAffinity({ ...focusedAffinity, weight: Number(value) });
  };

  useEffect(() => {
    if (!weight || weight < 1 || weight > 100) {
      setValidated(ValidatedOptions.error);
      setSubmitDisabled(true);
    } else {
      setValidated(ValidatedOptions.default);
      setSubmitDisabled(false);
    }
  }, [weight, setSubmitDisabled]);

  return (
    <FormGroup fieldId="weight" isRequired label={t('Weight')}>
      <TextInput
        onChange={(_event, value: string) => {
          onChange(_event, value);
        }}
        type="text"
        validated={validated}
        value={weight}
      />

      <FormGroupWithHelpText
        isRequired
        validated={validated}
        helperTextInvalid={WEIGHT_FIELD_HELP_TEXT}
        helperText={WEIGHT_FIELD_HELP_TEXT}
      />
    </FormGroup>
  );
};

export default PreferredAffinityWeightInput;
