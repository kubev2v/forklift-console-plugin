import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ClipboardCopy, Switch, TextInput, Tooltip } from '@patternfly/react-core';

import type { Field } from './components/list/Fields';

type ShowFieldWithClipboardCopyProps = {
  value: string;
  field?: Field;
};

/**
 * Displays a field with its value. If the value is empty, shows a disabled text input with a tooltip indicating the field is missing.
 * If the value is non-empty, displays the value in a read-only format with a clipboard copy functionality.
 *
 * @property {string} value - The value of the field to display.
 * @property {object} field - Object containing details about the field such as label and display type.
 */
export const FieldWithClipboardCopy: FC<ShowFieldWithClipboardCopyProps> = ({ field, value }) => {
  const { t } = useForkliftTranslation();

  // Render tooltip for missing value
  if (!value) {
    return (
      <Tooltip
        content={
          <div>{t('{{label}} field is missing from the secret data.', { label: field.label })}</div>
        }
      >
        <TextInput spellCheck="false" value="No value" type="text" isDisabled />
      </Tooltip>
    );
  }

  // Determine how to display the field based on its type
  const renderFieldByType = () => {
    switch (field.displayType) {
      case 'textArea':
        return (
          <ClipboardCopy
            isReadOnly
            hoverTip={t('Copy')}
            clickTip={t('Copied')}
            isCode
            variant="expansion"
          >
            {value}
          </ClipboardCopy>
        );
      case 'switch':
        return (
          <Switch
            aria-label={`Switch for ${field.label}`}
            label={`${field.label} is set`}
            isChecked={value.toLocaleLowerCase() === 'true'}
            hasCheckIcon
            isDisabled
          />
        );
      default:
        return (
          <ClipboardCopy isReadOnly hoverTip={t('Copy')} clickTip={t('Copied')} isCode>
            {value}
          </ClipboardCopy>
        );
    }
  };

  return renderFieldByType();
};
