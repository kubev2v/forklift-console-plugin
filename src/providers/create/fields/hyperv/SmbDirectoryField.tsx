import type { FC } from 'react';

import { useForkliftTranslation } from '@utils/i18n';

import { isValidSmbPath } from '../../utils/validationPatterns';
import { ProviderFormFieldId } from '../constants';
import ProviderFormTextInput from '../ProviderFormTextInput';

const SmbUrlField: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <ProviderFormTextInput
      label={t('SMB share URL')}
      fieldId={ProviderFormFieldId.SmbUrl}
      helperText={t(
        'SMB share containing exported Hyper-V VMs, for example: //192.168.1.100/hyperv-share',
      )}
      fieldRules={{
        required: t('SMB share URL is required'),
        validate: {
          pattern: (val): string | undefined => {
            if (!val) return undefined;
            if (!isValidSmbPath(val as string)) {
              return t('SMB path must be in format: //server/share or \\\\server\\share');
            }
            return undefined;
          },
        },
      }}
    />
  );
};

export default SmbUrlField;
