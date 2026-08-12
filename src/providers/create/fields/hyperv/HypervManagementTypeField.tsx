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
      defaultValue={HypervManagementType.Standalone}
      name={ProviderFormFieldId.MgmtType}
      render={({ field: { onChange, value } }) => (
        <FormGroup
          fieldId={ProviderFormFieldId.MgmtType}
          isRequired
          label={t('Management type')}
          role="radiogroup"
        >
          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
            <Radio
              data-testid="hyperv-management-standalone-radio"
              description={t('Single Hyper-V host')}
              id="hyperv-management-standalone"
              isChecked={value === HypervManagementType.Standalone}
              label={t('Standalone')}
              name={ProviderFormFieldId.MgmtType}
              onChange={() => {
                onChange(HypervManagementType.Standalone);
              }}
            />
            <Radio
              data-testid="hyperv-management-cluster-radio"
              description={t('Windows Failover Cluster with multiple nodes')}
              id="hyperv-management-cluster"
              isChecked={value === HypervManagementType.Cluster}
              label={t('Failover Cluster')}
              name={ProviderFormFieldId.MgmtType}
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
