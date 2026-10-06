import { useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import type { V1beta1Provider } from '@forklift-ui/types';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { ModalVariant, Stack, StackItem } from '@patternfly/react-core';
import {
  getCopyApplianceResourcePool,
  getToeholdDatastore,
  getToeholdFolder,
  getToeholdNetwork,
} from '@utils/crds/common/selectors';

import onCreateToeholdTemplate from './onCreateToeholdTemplate';
import ToeholdPlacementForm, { type ToeholdPlacementFormValues } from './ToeholdPlacementForm';
import {
  useToeholdPlacementLabels,
  useToeholdPlacementOptions,
} from './useToeholdPlacementOptions';

export type CreateToeholdTemplateModalProps = {
  provider: V1beta1Provider;
};

const CreateToeholdTemplateModal: OverlayComponent<CreateToeholdTemplateModalProps> = ({
  closeOverlay,
  provider,
}) => {
  const { t } = useForkliftTranslation();
  const [values, setValues] = useState<ToeholdPlacementFormValues>({
    datastore: getToeholdDatastore(provider) ?? '',
    folder: getToeholdFolder(provider) ?? '',
    network: getToeholdNetwork(provider) ?? '',
    resourcePool: getCopyApplianceResourcePool(provider) ?? '',
  });

  const {
    datastoreOptions,
    datastoreWarning,
    folderOptions,
    inventoryLoading,
    networkOptions,
    resourcePoolOptions,
  } = useToeholdPlacementOptions(provider, values.resourcePool);
  const labels = useToeholdPlacementLabels();

  const canSubmit = Boolean(
    values.datastore && values.folder && values.network && values.resourcePool,
  );

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      confirmLabel={t('Create')}
      isDisabled={!canSubmit || inventoryLoading}
      onConfirm={async () => {
        await onCreateToeholdTemplate(provider, values);
      }}
      title={t('Create ToeholdTemplate')}
      variant={ModalVariant.medium}
    >
      <Stack hasGutter>
        <StackItem>
          {t(
            'Select placement for the toehold template and copy appliances. These settings are required before the template can be built.',
          )}
        </StackItem>
        <StackItem>
          <ToeholdPlacementForm
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

export default CreateToeholdTemplateModal;
