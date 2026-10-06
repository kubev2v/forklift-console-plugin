import type { FC } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';

import { FilterableSelect } from '@components/FilterableSelect/FilterableSelect';
import { Form, type SelectOptionProps } from '@patternfly/react-core';

export type ToeholdPlacementFormValues = {
  datastore: string;
  folder: string;
  network: string;
  resourcePool: string;
};

export type ToeholdPlacementFormProps = {
  datastoreOptions: SelectOptionProps[];
  datastoreWarning?: string;
  folderOptions: SelectOptionProps[];
  inventoryLoading: boolean;
  labels: {
    datastore: { help: string; label: string; placeholder: string };
    folder: { help: string; label: string; placeholder: string };
    network: { help: string; label: string; placeholder: string };
    resourcePool: { help: string; label: string; placeholder: string };
  };
  networkOptions: SelectOptionProps[];
  onChange: (field: keyof ToeholdPlacementFormValues, value: string) => void;
  resourcePoolOptions: SelectOptionProps[];
  values: ToeholdPlacementFormValues;
};

const ToeholdPlacementForm: FC<ToeholdPlacementFormProps> = ({
  datastoreOptions,
  datastoreWarning,
  folderOptions,
  inventoryLoading,
  labels,
  networkOptions,
  onChange,
  resourcePoolOptions,
  values,
}) => (
  <Form>
    <FormGroupWithHelpText
      fieldId="toehold-datastore"
      helperText={datastoreWarning ?? labels.datastore.help}
      isRequired
      label={labels.datastore.label}
      validated={datastoreWarning ? 'warning' : 'default'}
    >
      <FilterableSelect
        isDisabled={inventoryLoading}
        isScrollable
        onSelect={(selected) => {
          onChange('datastore', selected.toString());
        }}
        placeholder={labels.datastore.placeholder}
        selectOptions={datastoreOptions}
        value={values.datastore}
      />
    </FormGroupWithHelpText>
    <FormGroupWithHelpText
      fieldId="toehold-folder"
      helperText={labels.folder.help}
      isRequired
      label={labels.folder.label}
    >
      <FilterableSelect
        isDisabled={inventoryLoading}
        isScrollable
        onSelect={(selected) => {
          onChange('folder', selected.toString());
        }}
        placeholder={labels.folder.placeholder}
        selectOptions={folderOptions}
        value={values.folder}
      />
    </FormGroupWithHelpText>
    <FormGroupWithHelpText
      fieldId="toehold-network"
      helperText={labels.network.help}
      isRequired
      label={labels.network.label}
    >
      <FilterableSelect
        isDisabled={inventoryLoading}
        isScrollable
        onSelect={(selected) => {
          onChange('network', selected.toString());
        }}
        placeholder={labels.network.placeholder}
        selectOptions={networkOptions}
        value={values.network}
      />
    </FormGroupWithHelpText>
    <FormGroupWithHelpText
      fieldId="copy-appliance-resource-pool"
      helperText={labels.resourcePool.help}
      isRequired
      label={labels.resourcePool.label}
    >
      <FilterableSelect
        isDisabled={inventoryLoading}
        isScrollable
        onSelect={(selected) => {
          onChange('resourcePool', selected.toString());
        }}
        placeholder={labels.resourcePool.placeholder}
        selectOptions={resourcePoolOptions}
        value={values.resourcePool}
      />
    </FormGroupWithHelpText>
  </Form>
);

export default ToeholdPlacementForm;
