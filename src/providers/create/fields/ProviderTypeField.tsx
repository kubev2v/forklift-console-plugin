import type { FC } from 'react';
import { useController } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import Select from '@components/common/Select';
import DevPreviewLabel from '@components/PreviewLabels/DevPreviewLabel';
import TechPreviewLabel from '@components/PreviewLabels/TechPreviewLabel';
import { Flex, FlexItem, SelectList, SelectOption } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useClusterIsAwsPlatform } from '@utils/hooks/useClusterIsAwsPlatform';
import { useIsDarkTheme } from '@utils/hooks/useIsDarkTheme';
import { useForkliftTranslation } from '@utils/i18n';
import { getProviderTypeOptions } from '@utils/providers/getProviderTypeOptions';

import { useCreateProviderFormContext } from '../hooks/useCreateProviderFormContext';

import { ProviderFormFieldId } from './constants';

import './ProviderTypeField.style.scss';

const ProviderTypeField: FC = () => {
  const { t } = useForkliftTranslation();
  const isDarkTheme = useIsDarkTheme();
  const { isAwsPlatform } = useClusterIsAwsPlatform();
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

  const providerTypeOptions = getProviderTypeOptions(isDarkTheme, isAwsPlatform);

  const onSelect = (
    _event: React.MouseEvent | undefined,
    itemId: string | number | undefined,
  ): void => {
    if (typeof itemId === 'string') {
      onChange(itemId);
    }
  };

  return (
    <FormGroupWithHelpText
      fieldId={ProviderFormFieldId.ProviderType}
      helperTextInvalid={error?.message}
      isRequired
      label={t('Provider type')}
      validated={getInputValidated(error)}
    >
      <Select
        className="provider-type-select"
        id="provider-type-select"
        onSelect={onSelect}
        options={providerTypeOptions}
        placeholder={t('Select a provider type')}
        testId="provider-type-toggle"
        value={value}
      >
        <SelectList data-testid="provider-type-menu">
          {providerTypeOptions.map((option) => (
            <SelectOption
              data-testid={`provider-type-option-${option.value}`}
              description={option.description}
              icon={option.icon}
              key={option.value}
              value={option.value}
            >
              {option.techPreview || option.devPreview ? (
                <Flex
                  alignItems={{ default: 'alignItemsCenter' }}
                  spaceItems={{ default: 'spaceItemsSm' }}
                >
                  <FlexItem>{option.label}</FlexItem>
                  <FlexItem>
                    {option.techPreview ? <TechPreviewLabel /> : <DevPreviewLabel />}
                  </FlexItem>
                </Flex>
              ) : (
                option.label
              )}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
    </FormGroupWithHelpText>
  );
};

export default ProviderTypeField;
