import { VddkSetupMode } from 'src/providers/utils/constants';

import {
  CopyApplianceTemplateModel,
  ProviderModel,
  type V1beta1CopyApplianceTemplate,
  type V1beta1Provider,
} from '@forklift-ui/types';
import { k8sDelete, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';

import onCreateCopyApplianceTemplate from '../DetailsSection/onCreateCopyApplianceTemplate';

import { buildDiskTransferProviderPatches } from './buildDiskTransferProviderPatches';
import { createDiskTransferSaveError, isNotFound } from './diskTransferSaveErrors';
import type { DiskTransferValues } from './types';

const patchProvider = async (
  provider: V1beta1Provider,
  values: DiskTransferValues,
): Promise<V1beta1Provider> => {
  const patches = buildDiskTransferProviderPatches(provider, values);
  if (isEmpty(patches)) {
    return Promise.resolve(provider);
  }
  return k8sPatch({ data: patches, model: ProviderModel, resource: provider });
};

const createTemplate = async (
  provider: V1beta1Provider,
  values: DiskTransferValues,
): Promise<void> => {
  try {
    await onCreateCopyApplianceTemplate(provider, values.placement);
  } catch (error) {
    throw createDiskTransferSaveError(
      t(
        'Provider settings were saved, but the copy appliance template could not be created. Retry to complete setup. {{reason}}',
        { reason: error instanceof Error ? error.message : String(error) },
      ),
      false,
    );
  }
};

const deleteTemplate = async (template: V1beta1CopyApplianceTemplate): Promise<void> => {
  try {
    await k8sDelete({ model: CopyApplianceTemplateModel, resource: template });
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }
  }
};

const saveAfterTemplateDeletion = async (
  provider: V1beta1Provider,
  values: DiskTransferValues,
): Promise<void> => {
  try {
    await patchProvider(provider, values);
  } catch (error) {
    throw createDiskTransferSaveError(
      t(
        'The copy appliance template was deleted, but provider settings could not be saved. Retry to finish the change. {{reason}}',
        { reason: error instanceof Error ? error.message : String(error) },
      ),
      true,
    );
  }
};

export const saveDiskTransferSettings = async (
  provider: V1beta1Provider,
  template: V1beta1CopyApplianceTemplate | undefined,
  values: DiskTransferValues,
): Promise<void> => {
  if (values.method === VddkSetupMode.CopyAppliance) {
    const updatedProvider = await patchProvider(provider, values);
    if (!template) {
      await createTemplate(updatedProvider, values);
    }
    return;
  }
  if (template) {
    await deleteTemplate(template);
    await saveAfterTemplateDeletion(provider, values);
    return;
  }
  await patchProvider(provider, values);
};
