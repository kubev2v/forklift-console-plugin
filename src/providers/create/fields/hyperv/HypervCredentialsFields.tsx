import type { FC } from 'react';
import { useWatch } from 'react-hook-form';

import { useForkliftTranslation } from '@utils/i18n';

import { useCreateProviderFormContext } from '../../hooks/useCreateProviderFormContext';
import { HypervTransferMethod, ProviderFormFieldId } from '../constants';
import ProviderFormPasswordInput from '../ProviderFormPasswordInput';
import ProviderFormTextInput from '../ProviderFormTextInput';

import SmbCredentialsFields from './SmbCredentialsFields';
import SmbUrlField from './SmbDirectoryField';

const HypervCredentialsFields: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreateProviderFormContext();
  const transferMethod = useWatch({ control, name: ProviderFormFieldId.TransferMethod });
  const smbUrl = useWatch({ control, name: ProviderFormFieldId.SmbUrl });
  const isSMB = transferMethod !== HypervTransferMethod.ISCSI;
  const showCredentials = !isSMB || Boolean(smbUrl?.trim());

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
            helperText={t(
              'IP address or hostname of the Hyper-V server, for example: 192.168.1.100',
            )}
            label={t('Hyper-V host')}
            testId="hyperv-host-input"
          />

          <ProviderFormTextInput
            fieldId={ProviderFormFieldId.HypervUsername}
            fieldRules={{
              required: t('Username is required'),
            }}
            helperText={t(
              'Username for connecting to the Hyper-V server, for example: Administrator',
            )}
            label={t('Username')}
            testId="hyperv-username-input"
          />

          <ProviderFormPasswordInput
            fieldId={ProviderFormFieldId.HypervPassword}
            fieldRules={{
              required: t('Password is required'),
            }}
            helperText={t('Password for connecting to the Hyper-V server')}
            label={t('Password')}
            testId="hyperv-password-input"
          />
        </>
      )}

      {isSMB && smbUrl?.trim() && <SmbCredentialsFields />}
    </>
  );
};

export default HypervCredentialsFields;
