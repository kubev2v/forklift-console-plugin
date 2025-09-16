import { type Dispatch, type FC, type SetStateAction, useEffect, useState } from 'react';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { TOPOLOGY_KEY_FIELD_HELP_TEXT } from './utils/constants';
import type { AffinityRowData } from './utils/types';

type TopologyKeyInputProps = {
  focusedAffinity: AffinityRowData;
  setFocusedAffinity: Dispatch<SetStateAction<AffinityRowData>>;
  setSubmitDisabled: Dispatch<SetStateAction<boolean>>;
};

const TopologyKeyInput: FC<TopologyKeyInputProps> = ({
  focusedAffinity,
  setFocusedAffinity,
  setSubmitDisabled,
}) => {
  const { t } = useForkliftTranslation();
  const [validated, setValidated] = useState<ValidatedOptions>(ValidatedOptions.default);
  const { topologyKey } = focusedAffinity || {};

  const onChange = (value: string) => {
    setFocusedAffinity({ ...focusedAffinity, topologyKey: value });
  };

  useEffect(() => {
    if (!topologyKey || isEmpty(topologyKey)) {
      setValidated(ValidatedOptions.error);
      setSubmitDisabled(true);
    } else {
      setValidated(ValidatedOptions.default);
      setSubmitDisabled(false);
    }
  }, [topologyKey, setSubmitDisabled]);

  return (
    <FormGroup fieldId="topology-key" isRequired label={t('Topology key')}>
      <TextInput
        onChange={(_event, value: string) => {
          onChange(value);
        }}
        type="text"
        validated={validated}
        value={topologyKey}
      />
      <FormGroupWithHelpText
        isRequired
        validated={validated}
        helperTextInvalid={TOPOLOGY_KEY_FIELD_HELP_TEXT}
        helperText={TOPOLOGY_KEY_FIELD_HELP_TEXT}
      />
    </FormGroup>
  );
};

export default TopologyKeyInput;
