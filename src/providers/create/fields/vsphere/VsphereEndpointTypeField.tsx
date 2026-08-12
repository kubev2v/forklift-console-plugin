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
      defaultValue={VSphereEndpointType.VCenter}
      name={ProviderFormFieldId.VsphereEndpointType}
      render={({ field: { onChange, value } }) => (
        <FormGroupWithHelpText
          fieldId={ProviderFormFieldId.VsphereEndpointType}
          isRequired
          label={t('vSphere endpoint')}
          role="radiogroup"
        >
          <Radio
            data-testid="vsphere-endpoint-vcenter-radio"
            id="vsphere-endpoint-vcenter"
            isChecked={value === VSphereEndpointType.VCenter}
            label={t('vCenter')}
            name={ProviderFormFieldId.VsphereEndpointType}
            onChange={() => {
              onChange(VSphereEndpointType.VCenter);
            }}
          />
          <Radio
            data-testid="vsphere-endpoint-esxi-radio"
            id="vsphere-endpoint-esxi"
            isChecked={value === VSphereEndpointType.ESXi}
            label={t('ESXi')}
            name={ProviderFormFieldId.VsphereEndpointType}
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
