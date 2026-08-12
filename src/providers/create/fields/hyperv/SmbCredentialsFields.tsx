import type { FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Checkbox, FormGroup } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { CreateProviderFormData } from '../../types';
import { ProviderFormFieldId } from '../constants';
import ProviderFormPasswordInput from '../ProviderFormPasswordInput';
import ProviderFormTextInput from '../ProviderFormTextInput';

const SmbCredentialsFields: FC = () => {
  const { t } = useForkliftTranslation();
  const { clearErrors, control, setValue } = useFormContext<CreateProviderFormData>();

  const useDifferentSmbCredentials = useWatch({
    control,
    name: ProviderFormFieldId.UseDifferentSmbCredentials,
  });

  const handleCheckboxChange = (_event: React.FormEvent<HTMLInputElement>, checked: boolean) => {
    setValue(ProviderFormFieldId.UseDifferentSmbCredentials, checked);
    if (!checked) {
      // Clear SMB credential fields when unchecking
      setValue(ProviderFormFieldId.SmbUser, '');
      setValue(ProviderFormFieldId.SmbPassword, '');
      clearErrors([ProviderFormFieldId.SmbUser, ProviderFormFieldId.SmbPassword]);
    }
  };

  return (
    <>
      <FormGroup fieldId={ProviderFormFieldId.UseDifferentSmbCredentials}>
        <Checkbox
          description={t(
            'Check this if the SMB share requires different credentials than the Hyper-V server',
          )}
          id={ProviderFormFieldId.UseDifferentSmbCredentials}
          isChecked={useDifferentSmbCredentials ?? false}
          label={t('Use different credentials for SMB share')}
          onChange={handleCheckboxChange}
        />
      </FormGroup>

      {useDifferentSmbCredentials && (
        <>
          <ProviderFormTextInput
            fieldId={ProviderFormFieldId.SmbUser}
            fieldRules={{
              required: t('SMB username is required when using different credentials'),
            }}
            helperText={t('Username for accessing the SMB share, for example: DOMAIN\\username')}
            label={t('SMB username')}
            testId="smb-user-input"
          />

          <ProviderFormPasswordInput
            fieldId={ProviderFormFieldId.SmbPassword}
            fieldRules={{
              required: t('SMB password is required when using different credentials'),
            }}
            helperText={t('Password for accessing the SMB share')}
            label={t('SMB password')}
            testId="smb-password-input"
          />
        </>
      )}
    </>
  );
};

export default SmbCredentialsFields;
