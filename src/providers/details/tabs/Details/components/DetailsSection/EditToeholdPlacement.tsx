import { useState } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FilterableSelect } from '@components/FilterableSelect/FilterableSelect';
import ModalForm from '@components/ModalForm/ModalForm';
import type { V1beta1Provider } from '@forklift-ui/types';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Form, ModalVariant, Stack, StackItem } from '@patternfly/react-core';
import {
  getCopyApplianceResourcePool,
  getToeholdDatastore,
  getToeholdFolder,
  getToeholdNetwork,
} from '@utils/crds/common/selectors';

import onUpdateToeholdSetting, { type ToeholdSettingField } from './onUpdateToeholdPlacement';
import {
  useToeholdPlacementLabels,
  useToeholdPlacementOptions,
} from './useToeholdPlacementOptions';

export type EditToeholdPlacementProps = {
  field: ToeholdSettingField;
  provider: V1beta1Provider;
};

const getters: Record<ToeholdSettingField, (provider: V1beta1Provider) => string | undefined> = {
  datastore: getToeholdDatastore,
  folder: getToeholdFolder,
  network: getToeholdNetwork,
  resourcePool: getCopyApplianceResourcePool,
};

const EditToeholdPlacement: OverlayComponent<EditToeholdPlacementProps> = ({
  closeOverlay,
  field,
  provider,
}) => {
  const { t } = useForkliftTranslation();
  const [value, setValue] = useState(getters[field](provider) ?? '');
  const labels = useToeholdPlacementLabels();
  const {
    datastoreOptions,
    datastoreWarning,
    folderOptions,
    inventoryLoading,
    networkOptions,
    resourcePoolOptions,
  } = useToeholdPlacementOptions(provider, field === 'resourcePool' ? value : '');

  const optionsByField = {
    datastore: datastoreOptions,
    folder: folderOptions,
    network: networkOptions,
    resourcePool: resourcePoolOptions,
  };
  const titles: Record<ToeholdSettingField, string> = {
    datastore: t('Edit datastore'),
    folder: t('Edit folder'),
    network: t('Edit network'),
    resourcePool: t('Edit resource pool'),
  };
  const { help, label, placeholder } = labels[field];
  const selectedWarning = field === 'datastore' ? datastoreWarning(value) : undefined;

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      onConfirm={async () => {
        await onUpdateToeholdSetting(provider, field, value);
      }}
      title={titles[field]}
      variant={ModalVariant.small}
    >
      <Stack hasGutter>
        <StackItem>
          <Form>
            <FormGroupWithHelpText
              fieldId={`toehold-${field}`}
              helperText={selectedWarning ?? help}
              label={label}
              validated={selectedWarning ? 'warning' : 'default'}
            >
              <FilterableSelect
                isDisabled={inventoryLoading}
                isScrollable
                onSelect={(selected) => {
                  setValue(selected.toString());
                }}
                placeholder={placeholder}
                selectOptions={optionsByField[field]}
                value={value}
              />
            </FormGroupWithHelpText>
          </Form>
        </StackItem>
      </Stack>
    </ModalForm>
  );
};

export default EditToeholdPlacement;
