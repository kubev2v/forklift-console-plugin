import type { FC } from 'react';
import { validateEsxiURL } from 'src/modules/Providers/utils/validators/provider/vsphere/validateEsxiURL';
import { validateVCenterURL } from 'src/modules/Providers/utils/validators/provider/vsphere/validateVCenterURL';
import { VSphereEndpointType } from 'src/providers/utils/constants';

import { useForkliftTranslation } from '@utils/i18n';
import { ValidationState } from '@utils/validation/Validation';

import { useCreateProviderFormContext } from '../../hooks/useCreateProviderFormContext';
import { CertificateValidationMode, ProviderFormFieldId } from '../constants';
import ProviderFormTextInput from '../ProviderFormTextInput';

const VsphereUrlField: FC = () => {
  const { t } = useForkliftTranslation();
  const { watch } = useCreateProviderFormContext();

  const [endpointType, certificateValidation] = watch([
    ProviderFormFieldId.VsphereEndpointType,
    ProviderFormFieldId.CertificateValidation,
  ]);

  return (
    <ProviderFormTextInput
      fieldId={ProviderFormFieldId.VsphereUrl}
      fieldRules={{
        required: t('URL is required'),
        validate: (val: string | undefined) => {
          const isSkippingCertificate = certificateValidation === CertificateValidationMode.Skip;

          const result =
            endpointType === VSphereEndpointType.ESXi
              ? validateEsxiURL(val)
              : validateVCenterURL(val, isSkippingCertificate ? btoa('true') : btoa('false'));

          if (result.type === ValidationState.Error && typeof result.msg === 'string') {
            return result.msg;
          }

          return true;
        },
      }}
      label={t('API endpoint URL')}
      helperText={t('For example: https://host-example.com/sdk.')}
      testId="vsphere-url-input"
    />
  );
};

export default VsphereUrlField;
