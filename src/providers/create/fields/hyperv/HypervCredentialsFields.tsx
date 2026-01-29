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
        fieldId={ProviderFormFieldId.HypervHost}
        fieldRules={{
          required: t('Hyper-V host is required'),
        }}
        label={t('Hyper-V host')}
        helperText={t('IP address or hostname of the Hyper-V server, for example: 192.168.1.100')}
        testId="hyperv-host-input"
      />

      <ProviderFormTextInput
        fieldId={ProviderFormFieldId.HypervUsername}
        fieldRules={{
          required: t('Username is required'),
        }}
        label={t('Username')}
        helperText={t('Username for connecting to the Hyper-V server, for example: Administrator')}
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
  );
};

export default HypervCredentialsFields;
