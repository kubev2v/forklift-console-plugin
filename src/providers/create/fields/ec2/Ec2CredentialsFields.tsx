import type { FC } from 'react';

import { useForkliftTranslation } from '@utils/i18n';

import { ProviderFormFieldId } from '../constants';
import ProviderFormPasswordInput from '../ProviderFormPasswordInput';
import ProviderFormTextInput from '../ProviderFormTextInput';

const Ec2CredentialsFields: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <ProviderFormTextInput
        fieldId={ProviderFormFieldId.Ec2AccessKeyId}
        fieldRules={{ required: t('Access key ID is required') }}
        label={t('Access key ID')}
        helperText={t('AWS access key ID for authenticating to the EC2 API')}
        testId="ec2-access-key-id-input"
      />

      <ProviderFormPasswordInput
        fieldId={ProviderFormFieldId.Ec2SecretAccessKey}
        fieldRules={{ required: t('Secret access key is required') }}
        label={t('Secret access key')}
        helperText={t('AWS secret access key for authenticating to the EC2 API')}
        testId="ec2-secret-access-key-input"
      />
    </>
  );
};

export default Ec2CredentialsFields;
