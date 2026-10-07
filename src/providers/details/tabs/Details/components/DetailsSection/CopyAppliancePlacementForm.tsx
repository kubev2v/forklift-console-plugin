import type { FC } from 'react';

import { Form, type SelectOptionProps } from '@patternfly/react-core';

import {
  COPY_APPLIANCE_SETTING_FIELDS,
  type CopyAppliancePlacementValues,
  type CopyApplianceSettingField,
} from './copyAppliancePlacementConfig';
import CopyAppliancePlacementField from './CopyAppliancePlacementField';
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
      {COPY_APPLIANCE_SETTING_FIELDS.map((field) => (
        <CopyAppliancePlacementField
          datastoreWarning={field === 'datastore' ? datastoreWarning : undefined}
          field={field}
          inventoryLoading={inventoryLoading}
          isRequired
          key={field}
          label={labels[field]}
          onChange={(value) => {
            onChange(field, value);
          }}
          selectOptions={optionsByField[field]}
          value={values[field]}
        />
      ))}
    </Form>
  );
};

export default CopyAppliancePlacementForm;
