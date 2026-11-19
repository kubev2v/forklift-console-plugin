import type { FC } from 'react';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { FilterableSelect } from '@components/FilterableSelect/FilterableSelect';
import { type SelectOptionProps, ValidatedOptions } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type DatacenterSelectProps = {
  allowCustomValue?: boolean;
  error?: string;
  includeAllDatacenters: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  names: string[];
  onChange: (value: string) => void;
  value: string;
};

const DatacenterSelect: FC<DatacenterSelectProps> = ({
  allowCustomValue = false,
  error,
  includeAllDatacenters,
  isDisabled,
  isRequired,
  names,
  onChange,
  value,
}) => {
  const { t } = useForkliftTranslation();
  const selectOptions: SelectOptionProps[] = [
    ...(includeAllDatacenters ? [{ children: t('All datacenters'), itemId: '' }] : []),
    ...names.map((name) => ({ children: name, itemId: name })),
  ];

  return (
    <FormGroupWithHelpText
      fieldId="provider-datacenter-select"
      helperText={t('Select a datacenter')}
      helperTextInvalid={error}
      isRequired={isRequired}
      label={t('Datacenter')}
      testId="provider-datacenter-select-helper"
      validated={error ? ValidatedOptions.error : ValidatedOptions.default}
    >
      <FilterableSelect
        canCreate={allowCustomValue}
        createNewOptionLabel={t('Use datacenter')}
        isDisabled={isDisabled}
        onSelect={(selected) => {
          onChange(selected.toString());
        }}
        placeholder={isRequired ? t('Select a datacenter') : t('All datacenters')}
        selectOptions={selectOptions}
        value={value}
      />
    </FormGroupWithHelpText>
  );
};

export default DatacenterSelect;
