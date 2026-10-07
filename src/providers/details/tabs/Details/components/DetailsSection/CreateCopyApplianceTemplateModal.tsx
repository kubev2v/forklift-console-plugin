import { useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import type { V1beta1Provider } from '@forklift-ui/types';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { ModalVariant, Stack, StackItem } from '@patternfly/react-core';
import {
  getCopyApplianceDatastore,
  getCopyApplianceFolder,
  getCopyApplianceNetwork,
  getCopyApplianceResourcePool,
} from '@utils/crds/common/selectors';

import CopyAppliancePlacementForm, {
  type CopyAppliancePlacementFormValues,
} from './CopyAppliancePlacementForm';
import onCreateCopyApplianceTemplate from './onCreateCopyApplianceTemplate';
import {
  useCopyAppliancePlacementLabels,
  useCopyAppliancePlacementOptions,
} from './useCopyAppliancePlacementOptions';

export type CreateCopyApplianceTemplateModalProps = {
  provider: V1beta1Provider;
};

const CreateCopyApplianceTemplateModal: OverlayComponent<CreateCopyApplianceTemplateModalProps> = ({
  closeOverlay,
  provider,
}) => {
  const { t } = useForkliftTranslation();
  const [values, setValues] = useState<CopyAppliancePlacementFormValues>({
    datastore: getCopyApplianceDatastore(provider) ?? '',
    folder: getCopyApplianceFolder(provider) ?? '',
    network: getCopyApplianceNetwork(provider) ?? '',
    resourcePool: getCopyApplianceResourcePool(provider) ?? '',
  });

  const {
    datastoreOptions,
    datastoreWarning,
    folderOptions,
    inventoryLoading,
    networkOptions,
    resourcePoolOptions,
  } = useCopyAppliancePlacementOptions(provider, values.resourcePool);
  const labels = useCopyAppliancePlacementLabels();

  const canSubmit = Boolean(
    values.datastore && values.folder && values.network && values.resourcePool,
  );

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      confirmLabel={t('Create')}
      isDisabled={!canSubmit || inventoryLoading}
      onConfirm={async () => {
        await onCreateCopyApplianceTemplate(provider, values);
      }}
      title={t('Create CopyApplianceTemplate')}
      variant={ModalVariant.medium}
    >
      <Stack hasGutter>
        <StackItem>
          {t(
            'Select placement for the copy appliance template and copy appliances. These settings are required before the template can be built.',
          )}
        </StackItem>
        <StackItem>
          <CopyAppliancePlacementForm
            datastoreOptions={datastoreOptions}
            datastoreWarning={datastoreWarning(values.datastore)}
            folderOptions={folderOptions}
            inventoryLoading={inventoryLoading}
            labels={labels}
            networkOptions={networkOptions}
            onChange={(field, value) => {
              setValues((prev) => ({ ...prev, [field]: value }));
            }}
            resourcePoolOptions={resourcePoolOptions}
            values={values}
          />
        </StackItem>
      </Stack>
    </ModalForm>
  );
};

export default CreateCopyApplianceTemplateModal;
