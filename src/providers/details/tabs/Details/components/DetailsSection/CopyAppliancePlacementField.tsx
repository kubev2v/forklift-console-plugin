import type { FC } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';

import { FilterableSelect } from '@components/FilterableSelect/FilterableSelect';
import type { SelectOptionProps } from '@patternfly/react-core';

import {
  COPY_APPLIANCE_FIELD_IDS,
  type CopyApplianceSettingField,
} from './copyAppliancePlacementConfig';
import type { CopyAppliancePlacementFieldLabels } from './useCopyAppliancePlacementLabels';

type CopyAppliancePlacementFieldProps = {
  datastoreWarning?: string;
  field: CopyApplianceSettingField;
  inventoryLoading: boolean;
  isRequired?: boolean;
  label: CopyAppliancePlacementFieldLabels[CopyApplianceSettingField];
  onChange: (value: string) => void;
  selectOptions: SelectOptionProps[];
  value: string;
};

const CopyAppliancePlacementField: FC<CopyAppliancePlacementFieldProps> = ({
  datastoreWarning,
  field,
  inventoryLoading,
  isRequired = false,
  label,
  onChange,
  selectOptions,
  value,
}) => (
  <FormGroupWithHelpText
    fieldId={COPY_APPLIANCE_FIELD_IDS[field]}
    helperText={datastoreWarning ?? label.help}
    isRequired={isRequired}
    label={label.label}
    validated={datastoreWarning ? 'warning' : 'default'}
  >
    <FilterableSelect
      isDisabled={inventoryLoading}
      isScrollable
      onSelect={(selected) => {
        onChange(selected.toString());
      }}
      placeholder={label.placeholder}
      selectOptions={selectOptions}
      value={value}
    />
  </FormGroupWithHelpText>
);

export default CopyAppliancePlacementField;
