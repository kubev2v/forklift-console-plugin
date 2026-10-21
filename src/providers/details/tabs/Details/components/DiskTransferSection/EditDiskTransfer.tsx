import { useState } from 'react';
import DiskTransferMethodSelection from 'src/providers/components/DiskTransferMethodSelection';
import { VddkSetupMode } from 'src/providers/utils/constants';

import ModalForm from '@components/ModalForm/ModalForm';
import type { V1beta1CopyApplianceTemplate, V1beta1Provider } from '@forklift-ui/types';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Alert, AlertVariant, Form, ModalVariant } from '@patternfly/react-core';
import { getUseVddkAioOptimization, getVddkInitImage } from '@utils/crds/common/selectors';
import {
  getCopyApplianceDatastore,
  getCopyApplianceFolder,
  getCopyApplianceNetwork,
  getCopyApplianceResourcePool,
} from '@utils/crds/providers/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import type { CopyAppliancePlacementValues } from '../DetailsSection/copyAppliancePlacementConfig';
import { useCopyAppliancePlacementOptions } from '../DetailsSection/useCopyAppliancePlacementOptions';

import DiskTransferPlacementForm from './DiskTransferPlacementForm';
import { getDiskTransferMethod } from './getDiskTransferMethod';
import { getEditDiskTransferState } from './getEditDiskTransferState';
import { DiskTransferSaveError, saveDiskTransferSettings } from './saveDiskTransferSettings';
import TemplateDeletionConfirmation from './TemplateDeletionConfirmation';
import type { DiskTransferValues } from './types';

type EditDiskTransferProps = {
  canCreateTemplate: boolean;
  canDeleteTemplate: boolean;
  copyApplianceEnabled: boolean;
  createPermissionLoading: boolean;
  deletePermissionLoading: boolean;
  provider: V1beta1Provider;
  template?: V1beta1CopyApplianceTemplate;
  templateLookupUnavailable: boolean;
};

const EditDiskTransfer: OverlayComponent<EditDiskTransferProps> = ({
  canCreateTemplate,
  canDeleteTemplate,
  closeOverlay,
  copyApplianceEnabled,
  createPermissionLoading,
  deletePermissionLoading,
  provider,
  template,
  templateLookupUnavailable,
}) => {
  const { t } = useForkliftTranslation();
  const initialMethod = getDiskTransferMethod(provider, Boolean(template));
  const [method, setMethod] = useState(initialMethod);
  const [vddkImage, setVddkImage] = useState(getVddkInitImage(provider) ?? '');
  const [aioEnabled, setAioEnabled] = useState(getUseVddkAioOptimization(provider) === 'true');
  const [placement, setPlacement] = useState<CopyAppliancePlacementValues>({
    datastore: getCopyApplianceDatastore(provider) ?? '',
    folder: getCopyApplianceFolder(provider) ?? '',
    network: getCopyApplianceNetwork(provider) ?? '',
    resourcePool: getCopyApplianceResourcePool(provider) ?? '',
  });
  const [confirmedDeletion, setConfirmedDeletion] = useState(false);
  const [templateDeleted, setTemplateDeleted] = useState(false);
  const placementOptions = useCopyAppliancePlacementOptions(provider, placement.resourcePool);

  const activeTemplate = templateDeleted ? undefined : template;
  const { canSubmit, imageError, isAppliance, permissionError, requiresDeletion, templateError } =
    getEditDiskTransferState({
      canCreateTemplate,
      canDeleteTemplate,
      confirmedDeletion,
      copyApplianceEnabled,
      createPermissionLoading,
      deletePermissionLoading,
      initialMethod,
      inventoryError: placementOptions.inventoryError,
      inventoryLoading: placementOptions.inventoryLoading,
      method,
      placement,
      t,
      templateExists: Boolean(activeTemplate),
      templateLookupUnavailable,
      vddkImage,
    });

  const onConfirm = async (): Promise<void> => {
    if (!canSubmit) {
      throw new Error(t('Complete the required disk transfer settings before saving.'));
    }
    const values: DiskTransferValues = { aioEnabled, method, placement, vddkImage };
    try {
      await saveDiskTransferSettings(provider, activeTemplate, values);
    } catch (error) {
      if (error instanceof DiskTransferSaveError && error.templateDeleted) {
        setTemplateDeleted(true);
      }
      throw error;
    }
  };

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      isDisabled={!canSubmit}
      onConfirm={onConfirm}
      testId="edit-disk-transfer-modal"
      title={t('Edit disk transfer method')}
      variant={ModalVariant.large}
    >
      <Form>
        <DiskTransferMethodSelection
          aioEnabled={aioEnabled}
          imageError={imageError}
          isCopyApplianceEnabled={copyApplianceEnabled}
          method={method}
          onAioChange={setAioEnabled}
          onMethodChange={(nextMethod) => {
            setMethod(nextMethod);
            setConfirmedDeletion(false);
            if (nextMethod === VddkSetupMode.Upload && method !== VddkSetupMode.Upload) {
              setVddkImage('');
            }
          }}
          onVddkImageChange={setVddkImage}
          showCopyApplianceAlert={false}
          vddkImage={vddkImage}
        />
        {isAppliance && (
          <DiskTransferPlacementForm
            onChange={(field, value) => {
              setPlacement((current) => ({ ...current, [field]: value }));
            }}
            options={placementOptions}
            permissionError={permissionError}
            templateError={templateError}
            values={placement}
          />
        )}
        {requiresDeletion && (
          <TemplateDeletionConfirmation
            isChecked={confirmedDeletion}
            onChange={setConfirmedDeletion}
          />
        )}
        {!isAppliance && (permissionError ?? templateError) && (
          <Alert isInline title={permissionError ?? templateError} variant={AlertVariant.danger}>
            {permissionError && templateError ? templateError : null}
          </Alert>
        )}
      </Form>
    </ModalForm>
  );
};

export default EditDiskTransfer;
