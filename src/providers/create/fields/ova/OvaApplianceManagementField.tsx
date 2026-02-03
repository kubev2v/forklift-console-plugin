import type { FC } from 'react';
import { useController } from 'react-hook-form';
import {
  OVA_APPLIANCE_MANAGEMENT_DESCRIPTION,
  OVA_APPLIANCE_MANAGEMENT_LABEL,
} from 'src/providers/utils/constants';

import { Checkbox, FormGroup } from '@patternfly/react-core';

import { useCreateProviderFormContext } from '../../hooks/useCreateProviderFormContext';
import { ProviderFormFieldId } from '../constants';

const OvaApplianceManagementField: FC = () => {
  const { control } = useCreateProviderFormContext();

  const {
    field: { onChange, value },
  } = useController({
    control,
    name: ProviderFormFieldId.OvaApplianceManagement,
  });

  return (
    <FormGroup fieldId={ProviderFormFieldId.OvaApplianceManagement}>
      <Checkbox
        label={OVA_APPLIANCE_MANAGEMENT_LABEL}
        isChecked={value ?? false}
        onChange={(_event, checked) => {
          onChange(checked);
        }}
        id={ProviderFormFieldId.OvaApplianceManagement}
        name={ProviderFormFieldId.OvaApplianceManagement}
        data-testid="ova-appliance-management-checkbox"
        description={OVA_APPLIANCE_MANAGEMENT_DESCRIPTION}
      />
    </FormGroup>
  );
};

export default OvaApplianceManagementField;
