import type { FC } from 'react';
import { useController } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import Select from '@components/common/Select';
import { SelectList, SelectOption } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useIsDarkTheme } from '@utils/hooks/useIsDarkTheme';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreateProviderFormContext } from '../hooks/useCreateProviderFormContext';
import { getProviderTypeOptions } from '../utils/getProviderTypeOptions';

import { ProviderFormFieldId } from './constants';

import './ProviderTypeField.style.scss';

const ProviderTypeField: FC = () => {
  const { t } = useForkliftTranslation();
  const isDarkTheme = useIsDarkTheme();
  const { control } = useCreateProviderFormContext();

  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    control,
    name: ProviderFormFieldId.ProviderType,
    rules: {
      required: t('Provider type is required'),
    },
  });

  const providerTypeOptions = getProviderTypeOptions(isDarkTheme);

  const onSelect = (_event: React.MouseEvent | undefined, itemId: string | number | undefined) => {
    if (typeof itemId === 'string') {
      onChange(itemId);
    }
  };

  return (
    <FormGroupWithHelpText
      label={t('Provider type')}
      isRequired
      fieldId={ProviderFormFieldId.ProviderType}
      validated={getInputValidated(error)}
      helperTextInvalid={error?.message}
    >
      <Select
        className="provider-type-select"
        id="provider-type-select"
        value={value}
        options={providerTypeOptions}
        onSelect={onSelect}
        placeholder={t('Select a provider type')}
        testId="provider-type-toggle"
      >
        <SelectList data-testid="provider-type-menu">
          {providerTypeOptions.map((option) => (
            <SelectOption
              key={option.value}
              value={option.value}
              description={option.description}
              icon={option.icon}
              data-testid={`provider-type-option-${option.value}`}
            >
              {option.label}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
    </FormGroupWithHelpText>
  );
};

export default ProviderTypeField;
