import type { FC } from 'react';
import { Controller } from 'react-hook-form';
import { VSphereEndpointType } from 'src/providers/utils/constants';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { Radio } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreateProviderFormContext } from '../../hooks/useCreateProviderFormContext';
import { ProviderFormFieldId } from '../constants';

const VsphereEndpointTypeField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreateProviderFormContext();

  return (
    <Controller
      control={control}
      name={ProviderFormFieldId.VsphereEndpointType}
      defaultValue={VSphereEndpointType.vCenter}
      render={({ field: { onChange, value } }) => (
        <FormGroupWithHelpText
          role="radiogroup"
          fieldId={ProviderFormFieldId.VsphereEndpointType}
          label={t('vSphere endpoint')}
          isRequired
        >
          <Radio
            name={ProviderFormFieldId.VsphereEndpointType}
            label={t('vCenter')}
            id="vsphere-endpoint-vcenter"
            data-testid="vsphere-endpoint-vcenter-radio"
            isChecked={value === VSphereEndpointType.vCenter}
            onChange={() => {
              onChange(VSphereEndpointType.vCenter);
            }}
          />
          <Radio
            name={ProviderFormFieldId.VsphereEndpointType}
            label={t('ESXi')}
            id="vsphere-endpoint-esxi"
            data-testid="vsphere-endpoint-esxi-radio"
            isChecked={value === VSphereEndpointType.ESXi}
            onChange={() => {
              onChange(VSphereEndpointType.ESXi);
            }}
          />
        </FormGroupWithHelpText>
      )}
    />
  );
};

export default VsphereEndpointTypeField;
