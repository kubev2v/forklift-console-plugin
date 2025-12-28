import type { FC } from 'react';
import { SecretFieldsId } from 'src/providers/utils/constants';

import { ClipboardCopy, ClipboardCopyVariant } from '@patternfly/react-core';
import { EMPTY_MSG } from '@utils/constants';
import { useForkliftTranslation } from '@utils/i18n';

import { MASKED_MSG } from './utils/constants';

type CredentialContentFieldProps = {
  value: string | undefined;
  fieldKey?: SecretFieldsId;
  reveal: boolean;
};

const CredentialContentField: FC<CredentialContentFieldProps> = ({ fieldKey, reveal, value }) => {
  const { t } = useForkliftTranslation();

  if (!reveal) {
    return <>{MASKED_MSG}</>;
  }

  if (fieldKey && fieldKey === SecretFieldsId.InsecureSkipVerify) {
    return <>{value}</>;
  }

  if (value) {
    const isCaCert = fieldKey && fieldKey === SecretFieldsId.CaCert;

    return (
      <ClipboardCopy
        variant={isCaCert ? ClipboardCopyVariant.expansion : ClipboardCopyVariant.inlineCompact}
        isReadOnly={isCaCert}
        hoverTip={t('Copy to clipboard')}
        clickTip={t('Copied')}
      >
        {value}
      </ClipboardCopy>
    );
  }

  return <>{EMPTY_MSG}</>;
};

export default CredentialContentField;
