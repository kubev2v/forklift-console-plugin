import type { FC } from 'react';

import { useForkliftTranslation } from '@utils/i18n';

import { ProviderFormFieldId } from '../constants';
import ProviderFormPasswordInput from '../ProviderFormPasswordInput';
import ProviderFormTextInput from '../ProviderFormTextInput';

const HypervCredentialsFields: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <ProviderFormTextInput
        fieldId={ProviderFormFieldId.SmbUsername}
        fieldRules={{
          required: t('Username is required'),
        }}
        label={t('Username')}
        helperText={t(
          'Username for accessing the SMB share containing Hyper-V exported VMs, for example: DOMAIN\\username or username',
        )}
        testId="smb-username-input"
      />

      <ProviderFormPasswordInput
        fieldId={ProviderFormFieldId.SmbPassword}
        fieldRules={{
          required: t('Password is required'),
        }}
        label={t('Password')}
        helperText={t('Password for accessing the SMB share')}
        testId="smb-password-input"
      />
    </>
  );
};

export default HypervCredentialsFields;
