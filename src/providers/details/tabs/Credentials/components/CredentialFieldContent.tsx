import type { FC } from 'react';
import { SecretFieldsId } from 'src/providers/utils/constants';

import { ClipboardCopy, ClipboardCopyVariant } from '@patternfly/react-core';
import { EMPTY_MSG } from '@utils/constants';
import { useForkliftTranslation } from '@utils/i18n';

import { MASKED_MSG } from './utils/constants';

type CredentialContentFieldProps = {
  fieldKey?: SecretFieldsId;
  reveal: boolean;
  value: string | undefined;
};

const CredentialContentField: FC<CredentialContentFieldProps> = ({ fieldKey, reveal, value }) => {
  const { t } = useForkliftTranslation();

  if (!reveal) {
    return <>{MASKED_MSG}</>;
  }

  if (fieldKey && fieldKey === SecretFieldsId.InsecureSkipVerify) {
    if (value) return <>{value}</>;
    return <>{EMPTY_MSG}</>;
  }

  if (value) {
    const isCaCert = fieldKey && fieldKey === SecretFieldsId.CaCert;

    return (
      <ClipboardCopy
        clickTip={t('Copied')}
        hoverTip={t('Copy to clipboard')}
        isReadOnly={isCaCert}
        variant={isCaCert ? ClipboardCopyVariant.expansion : ClipboardCopyVariant.inlineCompact}
      >
        {value}
      </ClipboardCopy>
    );
  }

  return <>{EMPTY_MSG}</>;
};

export default CredentialContentField;
