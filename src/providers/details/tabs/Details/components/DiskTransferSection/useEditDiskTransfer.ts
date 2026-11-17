import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { validateVsphereDiskTransfer } from 'src/providers/create/fields/vsphere/vsphereFieldValidators';
import { VddkSetupMode } from 'src/providers/utils/constants';
import { getDiskTransferMethod } from 'src/providers/utils/getDiskTransferMethod';

import { FEATURE_NAMES } from '@utils/constants';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';
import { useForkliftTranslation } from '@utils/i18n';

import { isValidCopyAppliancePlacement } from '../DetailsSection/isValidCopyAppliancePlacement';
import { useCopyAppliancePlacementOptions } from '../DetailsSection/useCopyAppliancePlacementOptions';

import { wasCopyApplianceTemplateDeleted } from './diskTransferSaveErrors';
import {
  getCopyAppliancePermissionError,
  getTemplateLookupError,
  getTemplateOperation,
} from './diskTransferValidation';
import { getDiskTransferDefaultValues } from './getDiskTransferDefaultValues';
import { saveDiskTransferSettings } from './saveDiskTransferSettings';
import type { DiskTransferFormValues, EditDiskTransferProps, EditDiskTransferState } from './types';
import { useCopyApplianceTemplateAccess } from './useCopyApplianceTemplateAccess';

export const useEditDiskTransfer = ({
  provider,
  template,
  templateLookupUnavailable,
}: EditDiskTransferProps): EditDiskTransferState => {
  const { t } = useForkliftTranslation();
  const { isFeatureEnabled } = useFeatureFlags();
  const copyApplianceEnabled = isFeatureEnabled(FEATURE_NAMES.COPY_APPLIANCE);
  const form = useForm<DiskTransferFormValues>({
    defaultValues: getDiskTransferDefaultValues(provider, Boolean(template)),
  });
  const values = form.watch();
  const [templateDeleted, setTemplateDeleted] = useState(false);
  const activeTemplate = templateDeleted ? undefined : template;
  const isAppliance = values.method === VddkSetupMode.CopyAppliance;
  const operation = getTemplateOperation(isAppliance, Boolean(activeTemplate));
  const requiresDeletion = operation === 'delete';
  const access = useCopyApplianceTemplateAccess(provider, operation);
  const placementOptions = useCopyAppliancePlacementOptions(
    provider,
    values.placement.resourcePool,
  );
  const templateError = getTemplateLookupError(
    values.method,
    getDiskTransferMethod(provider, Boolean(template)),
    templateLookupUnavailable,
  );
  const validationError = validateVsphereDiskTransfer(values.method, values.vddkImage);
  const imageError =
    values.method === VddkSetupMode.Upload && !values.vddkImage.trim()
      ? undefined
      : validationError;
  const permissionError = getCopyAppliancePermissionError(
    isAppliance,
    copyApplianceEnabled,
    templateLookupUnavailable,
    access.permissionError,
  );
  const placementReady =
    !placementOptions.inventoryLoading &&
    !placementOptions.inventoryError &&
    isValidCopyAppliancePlacement(values.placement, {
      datastore: placementOptions.datastoreOptions,
      folder: placementOptions.folderOptions,
      network: placementOptions.networkOptions,
      resourcePool: placementOptions.resourcePoolOptions,
    });
  const canSubmit =
    !access.loading &&
    !permissionError &&
    !templateError &&
    !validationError &&
    (!isAppliance || placementReady) &&
    (!requiresDeletion || values.confirmedDeletion);

  const onConfirm = async (): Promise<void> => {
    if (!canSubmit) {
      throw new Error(t('Complete the required disk transfer settings before saving.'));
    }
    try {
      await saveDiskTransferSettings(provider, activeTemplate, form.getValues());
    } catch (error) {
      if (wasCopyApplianceTemplateDeleted(error)) {
        setTemplateDeleted(true);
      }
      throw error;
    }
  };

  const onMethodChange = (method: VddkSetupMode): void => {
    form.setValue('confirmedDeletion', false);
    if (method === VddkSetupMode.Upload && form.getValues('method') !== method) {
      form.setValue('vddkImage', '');
    }
    form.setValue('method', method);
  };

  return {
    canSubmit,
    copyApplianceEnabled,
    imageError,
    isAppliance,
    onConfirm,
    onMethodChange,
    permissionError,
    placementOptions,
    requiresDeletion,
    setValue: form.setValue,
    templateError,
    values,
  };
};
