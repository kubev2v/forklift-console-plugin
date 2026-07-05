import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import { Flex, FormGroup, Radio } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreateProviderFormContext } from '../../hooks/useCreateProviderFormContext';
import { HypervManagementType, ProviderFormFieldId } from '../constants';

const HypervManagementTypeField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreateProviderFormContext();

  return (
    <Controller
      control={control}
      name={ProviderFormFieldId.MgmtType}
      defaultValue={HypervManagementType.Standalone}
      render={({ field: { onChange, value } }) => (
        <FormGroup
          role="radiogroup"
          fieldId={ProviderFormFieldId.MgmtType}
          label={t('Management type')}
          isRequired
        >
          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
            <Radio
              name={ProviderFormFieldId.MgmtType}
              label={t('Standalone')}
              description={t('Single Hyper-V host')}
              id="hyperv-management-standalone"
              data-testid="hyperv-management-standalone-radio"
              isChecked={value === HypervManagementType.Standalone}
              onChange={() => {
                onChange(HypervManagementType.Standalone);
              }}
            />
            <Radio
              name={ProviderFormFieldId.MgmtType}
              label={t('Failover Cluster')}
              description={t('Windows Failover Cluster with multiple nodes')}
              id="hyperv-management-cluster"
              data-testid="hyperv-management-cluster-radio"
              isChecked={value === HypervManagementType.Cluster}
              onChange={() => {
                onChange(HypervManagementType.Cluster);
              }}
            />
          </Flex>
        </FormGroup>
      )}
    />
  );
};

export default HypervManagementTypeField;
