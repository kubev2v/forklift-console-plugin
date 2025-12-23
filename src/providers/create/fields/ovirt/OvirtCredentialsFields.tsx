import type { FC } from 'react';

import { useForkliftTranslation } from '@utils/i18n';

import { ProviderFormFieldId } from '../constants';
import ProviderFormPasswordInput from '../ProviderFormPasswordInput';
import ProviderFormTextInput from '../ProviderFormTextInput';

import { validateOvirtPassword, validateOvirtUsername } from './ovirtFieldValidators';

const OvirtCredentialsFields: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <ProviderFormTextInput
        fieldId={ProviderFormFieldId.OvirtUsername}
        fieldRules={{
          required: t('Username is required'),
          validate: validateOvirtUsername,
        }}
        label={t('Username')}
        helperText={t(
          'A username for connecting to the Red Hat Virtualization Manager (RHVM) API endpoint, for example: name@internal',
        )}
        testId="ovirt-username-input"
      />

      <ProviderFormPasswordInput
        fieldId={ProviderFormFieldId.OvirtPassword}
        fieldRules={{
          required: t('Password is required'),
          validate: validateOvirtPassword,
        }}
        label={t('Password')}
        testId="ovirt-password-input"
      />
    </>
  );
};

export default OvirtCredentialsFields;
