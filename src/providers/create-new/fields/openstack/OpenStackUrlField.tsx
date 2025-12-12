import type { FC } from 'react';
import { useController } from 'react-hook-form';
import { validateOpenstackURL } from 'src/modules/Providers/utils/validators/provider/openstack/validateOpenstackURL';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';
import { ValidationState } from '@utils/validation/Validation';

import { useCreateProviderFormContext } from '../../hooks/useCreateProviderFormContext';
import { ProviderFormFieldId } from '../constants';

const OpenStackUrlField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreateProviderFormContext();

  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    control,
    name: ProviderFormFieldId.OpenstackUrl,
    rules: {
      required: t('OpenStack Identity (Keystone) API endpoint URL is required'),
      validate: (val: string | undefined) => {
        const result = validateOpenstackURL(val);

        if (result.type === ValidationState.Error && typeof result.msg === 'string') {
          return result.msg;
        }

        return true;
      },
    },
  });

  return (
    <FormGroupWithHelpText
      label={t('OpenStack Identity (Keystone) API endpoint URL')}
      isRequired
      fieldId={ProviderFormFieldId.OpenstackUrl}
      validated={getInputValidated(error)}
      helperText={t(
        'The URL of the OpenStack Identity (Keystone) API endpoint, for example: https://identity_service.com:5000/v3.',
      )}
      helperTextInvalid={error?.message}
    >
      <TextInput
        id={ProviderFormFieldId.OpenstackUrl}
        type="text"
        value={value ?? ''}
        onChange={(_event, val) => {
          onChange(val);
        }}
        validated={getInputValidated(error)}
        data-testid="openstack-url-input"
        spellCheck="false"
      />
    </FormGroupWithHelpText>
  );
};

export default OpenStackUrlField;
