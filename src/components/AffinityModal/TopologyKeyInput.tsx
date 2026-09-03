import type { Dispatch, FC, SetStateAction } from 'react';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { TOPOLOGY_KEY_FIELD_HELP_TEXT } from './utils/constants';
import type { AffinityRowData } from './utils/types';

type TopologyKeyInputProps = {
  focusedAffinity: AffinityRowData;
  setFocusedAffinity: Dispatch<SetStateAction<AffinityRowData>>;
};

const TopologyKeyInput: FC<TopologyKeyInputProps> = ({ focusedAffinity, setFocusedAffinity }) => {
  const { t } = useForkliftTranslation();
  const { topologyKey } = focusedAffinity || {};
  const isInvalid = !topologyKey || isEmpty(topologyKey);
  const validated = isInvalid ? ValidatedOptions.error : ValidatedOptions.default;

  const onChange = (value: string): void => {
    setFocusedAffinity({ ...focusedAffinity, topologyKey: value });
  };

  return (
    <FormGroup fieldId="topology-key" isRequired label={t('Topology key')}>
      <TextInput
        data-testid="affinity-topology-key-input"
        onChange={(_event, value: string) => {
          onChange(value);
        }}
        type="text"
        validated={validated}
        value={topologyKey}
      />
      <FormGroupWithHelpText
        helperText={TOPOLOGY_KEY_FIELD_HELP_TEXT}
        helperTextInvalid={TOPOLOGY_KEY_FIELD_HELP_TEXT}
        isRequired
        validated={validated}
      />
    </FormGroup>
  );
};

export default TopologyKeyInput;
