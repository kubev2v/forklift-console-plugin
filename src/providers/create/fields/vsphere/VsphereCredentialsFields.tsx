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

  return (
    <>
      <ProviderFormTextInput
        fieldId={ProviderFormFieldId.VsphereUsername}
        fieldRules={{
          validate: validateVsphereUsername,
        }}
        label={t('Username')}
        helperText={t(
          `Username for connecting to the vSphere API endpoint. For example: ${endpointType === VSphereEndpointType.vCenter ? 'admin@vsphere.local' : 'user'}.`,
        )}
        testId="vsphere-username-input"
      />

      <ProviderFormPasswordInput
        fieldId={ProviderFormFieldId.VspherePassword}
        fieldRules={{
          validate: validateVspherePassword,
        }}
        label={t('Password')}
        helperText={t('Password for connecting to the vSphere API endpoint.')}
        testId="vsphere-password-input"
      />
    </>
  );
};

export default VsphereCredentialsFields;
