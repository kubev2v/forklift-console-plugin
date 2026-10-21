import { validateVddkInitImage } from 'src/providers/create/fields/vsphere/vsphereFieldValidators';
import { VddkSetupMode } from 'src/providers/utils/constants';

import type { CopyAppliancePlacementValues } from '../DetailsSection/copyAppliancePlacementConfig';

type EditDiskTransferStateParams = {
  canCreateTemplate: boolean;
  canDeleteTemplate: boolean;
  confirmedDeletion: boolean;
  copyApplianceEnabled: boolean;
  createPermissionLoading: boolean;
  deletePermissionLoading: boolean;
  initialMethod: VddkSetupMode;
  inventoryError: Error | null;
  inventoryLoading: boolean;
  method: VddkSetupMode;
  placement: CopyAppliancePlacementValues;
  t: (key: string) => string;
  templateExists: boolean;
  templateLookupUnavailable: boolean;
  vddkImage: string;
};

type EditDiskTransferState = {
  canSubmit: boolean;
  imageError?: string;
  isAppliance: boolean;
  permissionError?: string;
  requiresDeletion: boolean;
  templateError?: string;
};

export const getEditDiskTransferState = ({
  canCreateTemplate,
  canDeleteTemplate,
  confirmedDeletion,
  copyApplianceEnabled,
  createPermissionLoading,
  deletePermissionLoading,
  initialMethod,
  inventoryError,
  inventoryLoading,
  method,
  placement,
  t,
  templateExists,
  templateLookupUnavailable,
  vddkImage,
}: EditDiskTransferStateParams): EditDiskTransferState => {
  const isAppliance = method === VddkSetupMode.CopyAppliance;
  const isVddk = method === VddkSetupMode.Manual || method === VddkSetupMode.Upload;
  const requiresDeletion = templateExists && !isAppliance;
  const validation = isVddk ? validateVddkInitImage(vddkImage) : true;
  const imageError = typeof validation === 'string' ? validation : undefined;
  const placementComplete = Boolean(
    placement.datastore && placement.folder && placement.network && placement.resourcePool,
  );
  let permissionError: string | undefined;
  if (isAppliance && !copyApplianceEnabled) {
    permissionError = t('Copy appliance setup is unavailable while the feature is disabled.');
  } else if (isAppliance && !templateExists && !canCreateTemplate && !templateLookupUnavailable) {
    permissionError = t('You do not have permission to create a copy appliance template.');
  } else if (requiresDeletion && !canDeleteTemplate && !templateLookupUnavailable) {
    permissionError = t('You do not have permission to delete the copy appliance template.');
  }
  const templateError =
    templateLookupUnavailable && (!isVddk || initialMethod === VddkSetupMode.CopyAppliance)
      ? t(
          'Unable to check whether a sourcing appliance template exists. Verify that CopyApplianceTemplate resources are available and readable, then try again.',
        )
      : undefined;
  const permissionLoading =
    (isAppliance && !templateExists && createPermissionLoading) ||
    (requiresDeletion && deletePermissionLoading);

  return {
    canSubmit:
      !permissionLoading &&
      !permissionError &&
      !templateError &&
      !imageError &&
      (!isAppliance || (placementComplete && !inventoryLoading && !inventoryError)) &&
      (!requiresDeletion || confirmedDeletion),
    imageError,
    isAppliance,
    permissionError,
    requiresDeletion,
    templateError,
  };
};
