import type { FC } from 'react';
import { validateK8sToken } from 'src/providers/utils/validators/common';

import { useForkliftTranslation } from '@utils/i18n';

import { ProviderFormFieldId } from '../constants';
import ProviderFormPasswordInput from '../ProviderFormPasswordInput';

const ServiceAccountTokenField: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <ProviderFormPasswordInput
      fieldId={ProviderFormFieldId.ServiceAccountToken}
      fieldRules={{
        validate: {
          validToken: async (val: string | undefined) => {
            const trimmedValue = val?.trim() ?? '';
            if (!trimmedValue) {
              return undefined;
            }
            if (!validateK8sToken(trimmedValue)) {
              return t('Invalid token, a valid Kubernetes service account token is required');
            }
            return undefined;
          },
        },
      }}
      label={t('Service account bearer token')}
      testId="service-account-token-input"
      helperText={t(
        'A service account token used for authenticating the connection to the API server.',
      )}
    />
  );
};

export default ServiceAccountTokenField;
