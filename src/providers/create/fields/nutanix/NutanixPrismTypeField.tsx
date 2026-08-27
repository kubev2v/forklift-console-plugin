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
      defaultValue={NutanixPrismType.Element}
      name={ProviderFormFieldId.NutanixPrismType}
      render={({ field: { onChange, value } }) => (
        <FormGroup
          fieldId={ProviderFormFieldId.NutanixPrismType}
          isRequired
          label={t('Prism endpoint type')}
          role="radiogroup"
        >
          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
            <Radio
              data-testid="nutanix-prism-element-radio"
              description={t('Connect directly to a single Nutanix cluster.')}
              id="nutanix-prism-element"
              isChecked={value === NutanixPrismType.Element}
              label={t('Prism Element')}
              name={ProviderFormFieldId.NutanixPrismType}
              onChange={() => {
                onChange(NutanixPrismType.Element);
              }}
            />
            <Radio
              data-testid="nutanix-prism-central-radio"
              description={t('Connect to Prism Central to manage multiple clusters.')}
              id="nutanix-prism-central"
              isChecked={value === NutanixPrismType.Central}
              label={t('Prism Central')}
              name={ProviderFormFieldId.NutanixPrismType}
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
