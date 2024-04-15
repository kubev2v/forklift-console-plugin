import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ClipboardCopy, ClipboardCopyVariant, TextInput } from '@patternfly/react-core';

export interface ShowFieldWithClipboardCopyProps {
  value: string;
}

/**
 * Show a readable field value.
 * If value is an empty string, show a field read ony text with a proper text message.
 * If value is a non empty string, show a read only field with a copy clipboard button
 *
 * @property value - field value
 */
export const ShowFieldWithClipboardCopy: React.FC<ShowFieldWithClipboardCopyProps> = ({
  value,
}) => {
  const { t } = useForkliftTranslation();

  return value ? (
    <ClipboardCopy
      isReadOnly
      hoverTip={t('Copy')}
      clickTip={t('Copied')}
      isCode
      variant={value && value.length > 128 ? ClipboardCopyVariant.expansion : undefined}
    >
      {value}
    </ClipboardCopy>
  ) : (
    <TextInput value={'< No value >'} type="text" isDisabled />
  );
};
