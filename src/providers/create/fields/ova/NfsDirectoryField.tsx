import type { FC } from 'react';

import { useForkliftTranslation } from '@utils/i18n';

import { NFS_PATH_REGEX } from '../../utils/validationPatterns';
import { ProviderFormFieldId } from '../constants';
import ProviderFormTextInput from '../ProviderFormTextInput';

const NfsDirectoryField: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <ProviderFormTextInput
      fieldId={ProviderFormFieldId.NfsDirectory}
      fieldRules={{
        validate: {
          pattern: async (val: string | undefined) => {
            if (!val || !NFS_PATH_REGEX.test(val)) {
              return t('NFS path must be in format: host:/path (e.g., 10.10.0.10:/ova)');
            }

            return undefined;
          },
        },
      }}
      label={t('NFS shared directory')}
      helperText={t('For example: 10.10.0.10:/ova')}
      testId="nfs-directory-input"
    />
  );
};

export default NfsDirectoryField;
