import type { FC } from 'react';
import { useWatch } from 'react-hook-form';

import { useForkliftTranslation } from '@utils/i18n';

import { HypervTransferMethod, ProviderFormFieldId } from '../constants';
import ProviderFormPasswordInput from '../ProviderFormPasswordInput';
import ProviderFormTextInput from '../ProviderFormTextInput';

import SmbCredentialsFields from './SmbCredentialsFields';
import SmbUrlField from './SmbDirectoryField';

const HypervCredentialsFields: FC = () => {
  const { t } = useForkliftTranslation();
  const transferMethod = useWatch({ name: ProviderFormFieldId.TransferMethod });
  const smbUrl: string | undefined = useWatch({ name: ProviderFormFieldId.SmbUrl });
  const isSMB = transferMethod !== HypervTransferMethod.ISCSI;
  const showCredentials = !isSMB || smbUrl?.trim();

  return (
    <>
      {isSMB && <SmbUrlField />}

      {showCredentials && (
        <>
          <ProviderFormTextInput
            fieldId={ProviderFormFieldId.HypervHost}
            fieldRules={{
              required: t('Hyper-V host is required'),
            }}
            label={t('Hyper-V host')}
            helperText={t(
              'IP address or hostname of the Hyper-V server, for example: 192.168.1.100',
            )}
            testId="hyperv-host-input"
          />

          <ProviderFormTextInput
            fieldId={ProviderFormFieldId.HypervUsername}
            fieldRules={{
              required: t('Username is required'),
            }}
            label={t('Username')}
            helperText={t(
              'Username for connecting to the Hyper-V server, for example: Administrator',
            )}
            testId="hyperv-username-input"
          />

          <ProviderFormPasswordInput
            fieldId={ProviderFormFieldId.HypervPassword}
            fieldRules={{
              required: t('Password is required'),
            }}
            label={t('Password')}
            helperText={t('Password for connecting to the Hyper-V server')}
            testId="hyperv-password-input"
          />
        </>
      )}

      {isSMB && smbUrl?.trim() && <SmbCredentialsFields />}
    </>
  );
};

export default HypervCredentialsFields;
