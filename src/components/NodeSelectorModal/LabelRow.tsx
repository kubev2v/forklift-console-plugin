import type { ClipboardEvent, FC } from 'react';

import {
  Button,
  ButtonVariant,
  FormGroup,
  Grid,
  GridItem,
  TextInput,
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

import type { LabelFields } from './utils/types';

type LabelRowProps = {
  label: LabelFields;
  onChange: (label: LabelFields) => void;
  onDelete: (id: number) => void;
  isLabelsVisible: boolean;
};

const LabelRow: FC<LabelRowProps> = ({ isLabelsVisible, label, onChange, onDelete }) => {
  const { t } = useForkliftTranslation();
  const { id, key, value } = label;

  const handlePasteLabelKey = (event: ClipboardEvent<HTMLInputElement>): void => {
    event.preventDefault();
    const text = event.clipboardData.getData('text');
    const strings = text.split('=');

    if (strings.length > 1) {
      onChange({ ...label, key: strings[0], value: strings[1] });
      return;
    }

    onChange({ ...label, key: text });
  };

  return (
    <Grid hasGutter rowSpan={2}>
      <GridItem span={6}>
        <FormGroup label={isLabelsVisible && t('Key')}>
          <TextInput
            aria-label={t('selector key')}
            data-testid="node-selector-key-input"
            isRequired
            onChange={(_event, newKey) => {
              onChange({ ...label, key: newKey });
            }}
            onPaste={handlePasteLabelKey}
            placeholder={t('Key')}
            type="text"
            value={key}
          />
        </FormGroup>
      </GridItem>
      <GridItem span={5}>
        <FormGroup label={isLabelsVisible && t('Value')}>
          <TextInput
            aria-label={t('selector value')}
            data-testid="node-selector-value-input"
            isRequired
            onChange={(_event, newValue) => {
              onChange({ ...label, value: newValue });
            }}
            placeholder={t('Value')}
            type="text"
            value={value}
          />
        </FormGroup>
      </GridItem>

      <GridItem span={1}>
        <FormGroup label={isLabelsVisible && ' '}>
          <Button
            onClick={() => {
              onDelete(id);
            }}
            variant={ButtonVariant.plain}
          >
            {<MinusCircleIcon />}
          </Button>
        </FormGroup>
      </GridItem>
    </Grid>
  );
};

export default LabelRow;
