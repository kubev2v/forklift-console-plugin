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
        label={t('Username')}
        testId="nutanix-username-input"
      />

      <ProviderFormPasswordInput
        fieldId={ProviderFormFieldId.NutanixPassword}
        fieldRules={{
          required: t('Password is required'),
        }}
        label={t('Password')}
        testId="nutanix-password-input"
      />
    </>
  );
};

export default NutanixCredentialsFields;
