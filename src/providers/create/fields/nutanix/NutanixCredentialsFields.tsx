import type { FC } from 'react';

import { useForkliftTranslation } from '@utils/i18n';

import { ProviderFormFieldId } from '../constants';
import ProviderFormPasswordInput from '../ProviderFormPasswordInput';
import ProviderFormTextInput from '../ProviderFormTextInput';

const NutanixCredentialsFields: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <ProviderFormTextInput
        fieldId={ProviderFormFieldId.NutanixUsername}
        fieldRules={{
          required: t('Username is required'),
        }}
        helperText={t('Username for connecting to the Nutanix Prism API endpoint.')}
        label={t('Username')}
        testId="nutanix-username-input"
      />

      <ProviderFormPasswordInput
        fieldId={ProviderFormFieldId.NutanixPassword}
        fieldRules={{
          required: t('Password is required'),
        }}
        helperText={t('Password for connecting to the Nutanix Prism API endpoint.')}
        label={t('Password')}
        testId="nutanix-password-input"
      />
    </>
  );
};

export default NutanixCredentialsFields;
