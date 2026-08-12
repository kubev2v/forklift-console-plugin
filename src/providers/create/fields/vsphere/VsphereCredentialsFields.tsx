import type { FC } from 'react';
import { VSphereEndpointType } from 'src/providers/utils/constants';

import { useForkliftTranslation } from '@utils/i18n';

import { useCreateProviderFormContext } from '../../hooks/useCreateProviderFormContext';
import { ProviderFormFieldId } from '../constants';
import ProviderFormPasswordInput from '../ProviderFormPasswordInput';
import ProviderFormTextInput from '../ProviderFormTextInput';

import { validateVspherePassword, validateVsphereUsername } from './vsphereFieldValidators';

const VsphereCredentialsFields: FC = () => {
  const { t } = useForkliftTranslation();
  const { watch } = useCreateProviderFormContext();
  const [endpointType] = watch([ProviderFormFieldId.VsphereEndpointType]);
  const usernameExample =
    endpointType === VSphereEndpointType.VCenter ? 'admin@vsphere.local' : 'user';

  return (
    <>
      <ProviderFormTextInput
        fieldId={ProviderFormFieldId.VsphereUsername}
        fieldRules={{
          validate: validateVsphereUsername,
        }}
        helperText={t(
          'Username for connecting to the vSphere API endpoint. For example: {{username}}.',
          { username: usernameExample },
        )}
        label={t('Username')}
        testId="vsphere-username-input"
      />

      <ProviderFormPasswordInput
        fieldId={ProviderFormFieldId.VspherePassword}
        fieldRules={{
          validate: validateVspherePassword,
        }}
        helperText={t('Password for connecting to the vSphere API endpoint.')}
        label={t('Password')}
        testId="vsphere-password-input"
      />
    </>
  );
};

export default VsphereCredentialsFields;
