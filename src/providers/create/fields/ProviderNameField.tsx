import type { FC } from 'react';
import { useController } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';
import { validateProviderName } from '@utils/validation/providerNameValidation';

import { useCreateProviderDataContext } from '../hooks/useCreateProviderDataContext';
import { useCreateProviderFormContext } from '../hooks/useCreateProviderFormContext';

import { ProviderFormFieldId } from './constants';

const ProviderNameField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreateProviderFormContext();
  const { providerNames } = useCreateProviderDataContext();

  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    control,
    name: ProviderFormFieldId.ProviderName,
    rules: {
      validate: (val: string) => validateProviderName(val, providerNames),
    },
  });

  return (
    <FormGroupWithHelpText
      fieldId={ProviderFormFieldId.ProviderName}
      helperTextInvalid={error?.message}
      isRequired
      label={t('Provider name')}
      validated={getInputValidated(error)}
    >
      <TextInput
        data-testid="provider-name-input"
        id={ProviderFormFieldId.ProviderName}
        onChange={(_event, val) => {
          onChange(val);
        }}
        type="text"
        validated={getInputValidated(error)}
        value={value}
      />
    </FormGroupWithHelpText>
  );
};

export default ProviderNameField;
