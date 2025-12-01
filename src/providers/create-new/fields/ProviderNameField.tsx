import type { FC } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { TextInput } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreateProviderDataContext } from '../hooks/useCreateProviderFormContext';
import { K8S_NAME_REGEX } from '../utils/validationPatterns';

import { ProviderFormFieldId } from './constants';

const ProviderNameField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useFormContext();
  const { providerNames } = useCreateProviderDataContext();

  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    control,
    name: ProviderFormFieldId.ProviderName,
    rules: {
      required: t('Provider resource name is required'),
      validate: {
        maxLength: async (val: string) => {
          if (val.length > 253) {
            return t('Name must be no more than 253 characters');
          }
          return true;
        },

        pattern: async (val: string) => {
          if (!K8S_NAME_REGEX.test(val)) {
            return t(
              'Name must consist of lower case alphanumeric characters or "-", and must start and end with an alphanumeric character',
            );
          }
          return true;
        },

        unique: async (val: string) => {
          if (providerNames?.includes(val)) {
            return t(`A provider named ${val} already exists in the system`);
          }
          return true;
        },
      },
    },
  });

  return (
    <FormGroupWithHelpText
      label={t('Provider resource name')}
      isRequired
      fieldId={ProviderFormFieldId.ProviderName}
      validated={error ? 'error' : 'default'}
      helperTextInvalid={error?.message}
    >
      <TextInput
        id={ProviderFormFieldId.ProviderName}
        type="text"
        value={value ?? ''}
        onChange={(_event, val) => {
          onChange(val);
        }}
        validated={error ? 'error' : 'default'}
        data-testid="provider-name-input"
      />
    </FormGroupWithHelpText>
  );
};

export default ProviderNameField;
