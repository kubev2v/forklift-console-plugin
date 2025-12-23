import type { FC } from 'react';
import { validateOvirtURL } from 'src/modules/Providers/utils/validators/provider/ovirt/validateOvirtURL';

import { useForkliftTranslation } from '@utils/i18n';
import { ValidationState } from '@utils/validation/Validation';

import { ProviderFormFieldId } from '../constants';
import ProviderFormTextInput from '../ProviderFormTextInput';

const OvirtUrlField: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <ProviderFormTextInput
      label={t('API endpoint URL')}
      fieldId={ProviderFormFieldId.OvirtUrl}
      fieldRules={{
        required: t(
          'The URL is required. URL should include the schema and path, for example: https://rhv-host-example.com/ovirt-engine/api',
        ),
        validate: (val: string | undefined) => {
          const result = validateOvirtURL(val);

          if (result.type === ValidationState.Error && typeof result.msg === 'string') {
            return result.msg;
          }

          return undefined;
        },
      }}
      helperText={t(
        'The URL of the Red Hat Virtualization Manager (RHVM) API endpoint, for example: https://rhv-host-example.com/ovirt-engine/api',
      )}
      testId="ovirt-url-input"
    />
  );
};

export default OvirtUrlField;
