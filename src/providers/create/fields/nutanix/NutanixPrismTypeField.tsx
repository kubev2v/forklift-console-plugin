import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import { Flex, FormGroup, Radio } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreateProviderFormContext } from '../../hooks/useCreateProviderFormContext';
import { NutanixPrismType, ProviderFormFieldId } from '../constants';

const NutanixPrismTypeField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreateProviderFormContext();

  return (
    <Controller
      control={control}
      name={ProviderFormFieldId.NutanixPrismType}
      defaultValue={NutanixPrismType.Element}
      render={({ field: { onChange, value } }) => (
        <FormGroup
          role="radiogroup"
          fieldId={ProviderFormFieldId.NutanixPrismType}
          label={t('Prism endpoint type')}
          isRequired
        >
          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
            <Radio
              name={ProviderFormFieldId.NutanixPrismType}
              label={t('Prism Element')}
              description={t('Connect directly to a single Nutanix cluster.')}
              id="nutanix-prism-element"
              data-testid="nutanix-prism-element-radio"
              isChecked={value === NutanixPrismType.Element}
              onChange={() => {
                onChange(NutanixPrismType.Element);
              }}
            />
            <Radio
              name={ProviderFormFieldId.NutanixPrismType}
              label={t('Prism Central')}
              description={t('Connect to Prism Central to manage multiple clusters.')}
              id="nutanix-prism-central"
              data-testid="nutanix-prism-central-radio"
              isChecked={value === NutanixPrismType.Central}
              onChange={() => {
                onChange(NutanixPrismType.Central);
              }}
            />
          </Flex>
        </FormGroup>
      )}
    />
  );
};

export default NutanixPrismTypeField;
