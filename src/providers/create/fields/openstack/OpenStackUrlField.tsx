import type { FC } from 'react';
import { validateOpenstackURL } from 'src/modules/Providers/utils/validators/provider/openstack/validateOpenstackURL';

import { useForkliftTranslation } from '@utils/i18n';
import { ValidationState } from '@utils/validation/Validation';

import { ProviderFormFieldId } from '../constants';
import ProviderFormTextInput from '../ProviderFormTextInput';

const OpenStackUrlField: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <ProviderFormTextInput
      label={t('OpenStack Identity (Keystone) API endpoint URL')}
      isRequired
      fieldId={ProviderFormFieldId.OpenstackUrl}
      testId="openstack-url-input"
      fieldRules={{
        validate: (val: string | undefined) => {
          const result = validateOpenstackURL(val);
          return result.type === ValidationState.Error && typeof result.msg === 'string'
            ? result.msg
            : undefined;
        },
      }}
      helperText={t(
        'The URL of the OpenStack Identity (Keystone) API endpoint, for example: https://identity_service.com:5000/v3.',
      )}
    />
  );
};

export default OpenStackUrlField;
