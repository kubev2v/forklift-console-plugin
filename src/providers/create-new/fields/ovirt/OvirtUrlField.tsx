import type { FC } from 'react';
import { useController } from 'react-hook-form';
import { validateOvirtURL } from 'src/modules/Providers/utils/validators/provider/ovirt/validateOvirtURL';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';
import { ValidationState } from '@utils/validation/Validation';

import { useCreateProviderFormContext } from '../../hooks/useCreateProviderFormContext';
import { ProviderFormFieldId } from '../constants';

const OvirtUrlField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreateProviderFormContext();

  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    control,
    name: ProviderFormFieldId.OvirtUrl,
    rules: {
      required: t(
        'The URL is required. URL should include the schema and path, for example: https://rhv-host-example.com/ovirt-engine/api',
      ),
      validate: (val: string | undefined) => {
        const result = validateOvirtURL(val);

        if (result.type === ValidationState.Error && typeof result.msg === 'string') {
          return result.msg;
        }

        return true;
      },
    },
  });

  return (
    <FormGroupWithHelpText
      label={t('API endpoint URL')}
      isRequired
      fieldId={ProviderFormFieldId.OvirtUrl}
      validated={getInputValidated(error)}
      helperText={t(
        'The URL of the Red Hat Virtualization Manager (RHVM) API endpoint, for example: https://rhv-host-example.com/ovirt-engine/api',
      )}
      helperTextInvalid={error?.message}
    >
      <TextInput
        id={ProviderFormFieldId.OvirtUrl}
        type="text"
        value={value ?? ''}
        onChange={(_event, val) => {
          onChange(val);
        }}
        validated={getInputValidated(error)}
        data-testid="ovirt-url-input"
        spellCheck="false"
      />
    </FormGroupWithHelpText>
  );
};

export default OvirtUrlField;
