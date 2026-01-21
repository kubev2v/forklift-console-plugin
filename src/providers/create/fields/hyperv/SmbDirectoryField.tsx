import type { FC } from 'react';

import { useForkliftTranslation } from '@utils/i18n';

import { isValidSmbPath } from '../../utils/validationPatterns';
import { ProviderFormFieldId } from '../constants';
import ProviderFormTextInput from '../ProviderFormTextInput';

const SmbDirectoryField: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <ProviderFormTextInput
      label={t('SMB shared directory')}
      fieldId={ProviderFormFieldId.SmbDirectory}
      helperText={t('For example: //server/share or \\\\server\\share')}
      fieldRules={{
        required: t('SMB shared directory is required'),
        validate: {
          pattern: async (val) => {
            if (!val || !isValidSmbPath(val as string)) {
              return t('SMB path must be in format: //server/share or \\\\server\\share');
            }
            return true;
          },
        },
      }}
    />
  );
};

export default SmbDirectoryField;
