import type { FC } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';

import { FilterableSelect } from '@components/FilterableSelect/FilterableSelect';
import { Form, type SelectOptionProps } from '@patternfly/react-core';

import {
  COPY_APPLIANCE_FIELD_IDS,
  COPY_APPLIANCE_SETTING_FIELDS,
  type CopyAppliancePlacementValues,
  type CopyApplianceSettingField,
} from './copyAppliancePlacementConfig';
import type { CopyAppliancePlacementFieldLabels } from './useCopyAppliancePlacementLabels';

type CopyAppliancePlacementFormProps = {
  datastoreOptions: SelectOptionProps[];
  datastoreWarning?: string;
  folderOptions: SelectOptionProps[];
  inventoryLoading: boolean;
  labels: CopyAppliancePlacementFieldLabels;
  networkOptions: SelectOptionProps[];
  onChange: (field: CopyApplianceSettingField, value: string) => void;
  resourcePoolOptions: SelectOptionProps[];
  values: CopyAppliancePlacementValues;
};

const CopyAppliancePlacementForm: FC<CopyAppliancePlacementFormProps> = ({
  datastoreOptions,
  datastoreWarning,
  folderOptions,
  inventoryLoading,
  labels,
  networkOptions,
  onChange,
  resourcePoolOptions,
  values,
}) => {
  const optionsByField: Record<CopyApplianceSettingField, SelectOptionProps[]> = {
    datastore: datastoreOptions,
    folder: folderOptions,
    network: networkOptions,
    resourcePool: resourcePoolOptions,
  };

  return (
    <Form>
      {COPY_APPLIANCE_SETTING_FIELDS.map((field) => {
        const warning = field === 'datastore' ? datastoreWarning : undefined;
        return (
          <FormGroupWithHelpText
            fieldId={COPY_APPLIANCE_FIELD_IDS[field]}
            helperText={warning ?? labels[field].help}
            isRequired
            key={field}
            label={labels[field].label}
            validated={warning ? 'warning' : 'default'}
          >
            <FilterableSelect
              isDisabled={inventoryLoading}
              isScrollable
              onSelect={(selected) => {
                onChange(field, selected.toString());
              }}
              placeholder={labels[field].placeholder}
              selectOptions={optionsByField[field]}
              value={values[field]}
            />
          </FormGroupWithHelpText>
        );
      })}
    </Form>
  );
};

export default CopyAppliancePlacementForm;
