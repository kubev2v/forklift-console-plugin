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

import { CopyApplianceTemplatePlacementMismatchError } from '../DetailsSection/CopyApplianceTemplatePlacementMismatchError';
import onCreateCopyApplianceTemplate from '../DetailsSection/onCreateCopyApplianceTemplate';

import { buildDiskTransferProviderPatches } from './buildDiskTransferProviderPatches';
import type { DiskTransferValues } from './types';

const NOT_FOUND_STATUS_CODE = 404;

export class DiskTransferSaveError extends Error {
  readonly templateDeleted: boolean;

  constructor(message: string, templateDeleted: boolean) {
    super(message);
    this.templateDeleted = templateDeleted;
  }
}

const isNotFound = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const apiError = error as { code?: number | string; status?: number | string };
  return (
    String(apiError.code) === String(NOT_FOUND_STATUS_CODE) ||
    String(apiError.status) === String(NOT_FOUND_STATUS_CODE)
  );
};

const patchProvider = async (
  provider: V1beta1Provider,
  values: DiskTransferValues,
): Promise<V1beta1Provider> => {
  const patches = buildDiskTransferProviderPatches(provider, values);
  if (isEmpty(patches)) {
    return provider;
  }
  return k8sPatch({ data: patches, model: ProviderModel, resource: provider });
};

export const saveDiskTransferSettings = async (
  provider: V1beta1Provider,
  template: V1beta1CopyApplianceTemplate | undefined,
  values: DiskTransferValues,
): Promise<void> => {
  if (values.method === VddkSetupMode.CopyAppliance) {
    const updatedProvider = await patchProvider(provider, values);
    if (!template) {
      try {
        await onCreateCopyApplianceTemplate(updatedProvider, values.placement);
      } catch (error) {
        if (error instanceof CopyApplianceTemplatePlacementMismatchError) {
          throw new DiskTransferSaveError(error.message, false);
        }
        throw new DiskTransferSaveError(
          t(
            'Provider settings were saved, but the copy appliance template could not be created. Retry to complete setup. {{reason}}',
            {
              reason: error instanceof Error ? error.message : String(error),
            },
          ),
          false,
        );
      }
    }
    return;
  }

  if (template) {
    try {
      await k8sDelete({ model: CopyApplianceTemplateModel, resource: template });
    } catch (error) {
      if (!isNotFound(error)) {
        throw error;
      }
    }
    try {
      await patchProvider(provider, values);
    } catch (error) {
      throw new DiskTransferSaveError(
        t(
          'The copy appliance template was deleted, but provider settings could not be saved. Retry to finish the change. {{reason}}',
          {
            reason: error instanceof Error ? error.message : String(error),
          },
        ),
        true,
      );
    }
    return;
  }

  await patchProvider(provider, values);
};
