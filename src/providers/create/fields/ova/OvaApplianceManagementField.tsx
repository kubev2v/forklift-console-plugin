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
        data-testid="ova-appliance-management-checkbox"
        description={OVA_APPLIANCE_MANAGEMENT_DESCRIPTION}
        id={ProviderFormFieldId.OvaApplianceManagement}
        isChecked={value ?? false}
        label={OVA_APPLIANCE_MANAGEMENT_LABEL}
        name={ProviderFormFieldId.OvaApplianceManagement}
        onChange={(_event, checked) => {
          onChange(checked);
        }}
      />
    </FormGroup>
  );
};

export default OvaApplianceManagementField;
