import { useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import type { V1beta1Provider } from '@forklift-ui/types';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Form, ModalVariant, Stack, StackItem } from '@patternfly/react-core';

import {
  COPY_APPLIANCE_SETTING_GETTERS,
  type CopyApplianceSettingField,
} from './copyAppliancePlacementConfig';
import CopyAppliancePlacementField from './CopyAppliancePlacementField';
import onUpdateCopyApplianceSetting from './onUpdateCopyAppliancePlacement';
import { useCopyAppliancePlacementLabels } from './useCopyAppliancePlacementLabels';
import { useCopyAppliancePlacementOptions } from './useCopyAppliancePlacementOptions';

type EditCopyAppliancePlacementProps = {
  field: CopyApplianceSettingField;
  provider: V1beta1Provider;
};

const EditCopyAppliancePlacement: OverlayComponent<EditCopyAppliancePlacementProps> = ({
  closeOverlay,
  field,
  provider,
}) => {
  const { t } = useForkliftTranslation();
  const [value, setValue] = useState(COPY_APPLIANCE_SETTING_GETTERS[field](provider) ?? '');
  const labels = useCopyAppliancePlacementLabels();
  const {
    datastoreOptions,
    datastoreWarning,
    folderOptions,
    inventoryLoading,
    networkOptions,
    resourcePoolOptions,
  } = useCopyAppliancePlacementOptions(provider, field === 'resourcePool' ? value : '');

  const optionsByField = {
    datastore: datastoreOptions,
    folder: folderOptions,
    network: networkOptions,
    resourcePool: resourcePoolOptions,
  };
  const titles: Record<CopyApplianceSettingField, string> = {
    datastore: t('Edit datastore'),
    folder: t('Edit folder'),
    network: t('Edit network'),
    resourcePool: t('Edit resource pool'),
  };
  const selectedWarning = field === 'datastore' ? datastoreWarning(value) : undefined;

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      onConfirm={async () => {
        await onUpdateCopyApplianceSetting(provider, field, value);
      }}
      title={titles[field]}
      variant={ModalVariant.small}
    >
      <Stack hasGutter>
        <StackItem>
          <Form>
            <CopyAppliancePlacementField
              datastoreWarning={selectedWarning}
              field={field}
              inventoryLoading={inventoryLoading}
              label={labels[field]}
              onChange={setValue}
              selectOptions={optionsByField[field]}
              value={value}
            />
          </Form>
        </StackItem>
      </Stack>
    </ModalForm>
  );
};

export default EditCopyAppliancePlacement;
