import type { FC } from 'react';

import { useForkliftTranslation } from '@utils/i18n';

import { ProviderFormFieldId } from '../constants';
import ProviderFormTextInput from '../ProviderFormTextInput';

const NutanixUrlField: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <ProviderFormTextInput
      label={t('Prism URL')}
      fieldId={ProviderFormFieldId.NutanixUrl}
      fieldRules={{
        required: t(
          'The URL is required. Provide the Nutanix Prism Central or Prism Element endpoint URL, for example: https://prism.example.com:9440',
        ),
      }}
      helperText={t('URL of the Nutanix Prism Central or Prism Element endpoint.')}
      testId="nutanix-url-input"
    />
  );
};

export default NutanixUrlField;
