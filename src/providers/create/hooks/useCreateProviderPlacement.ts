import { useCallback, useState } from 'react';
import type {
  CopyAppliancePlacementValues,
  CopyApplianceSettingField,
} from 'src/providers/details/tabs/Details/components/DetailsSection/copyAppliancePlacementConfig';
import { useCopyAppliancePlacementOptions } from 'src/providers/details/tabs/Details/components/DetailsSection/useCopyAppliancePlacementOptions';

import { ProviderModelGroupVersionKind, type V1beta1Provider } from '@forklift-ui/types';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { getProviderPhase } from '@utils/crds/providers/selectors';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';

import { isValidCopyAppliancePlacement } from '../utils/isValidCopyAppliancePlacement';
import { EMPTY_COPY_APPLIANCE_PLACEMENT } from '../utils/wizardConstants';

import type { CreateProviderPlacement } from './createProviderPlacement.types';

export const useCreateProviderPlacement = (
  provider: V1beta1Provider | undefined,
): CreateProviderPlacement => {
  const [values, setValues] = useState<CopyAppliancePlacementValues>(
    EMPTY_COPY_APPLIANCE_PLACEMENT,
  );
  const [watchedProvider, loaded, error] = useK8sWatchResource<V1beta1Provider>(
    provider
      ? {
          groupVersionKind: ProviderModelGroupVersionKind,
          name: getName(provider),
          namespace: getNamespace(provider),
          namespaced: true,
        }
      : null,
  );
  const phase = getProviderPhase(watchedProvider);
  const isReady = Boolean(provider) && loaded && !error && phase === 'Ready';
  const options = useCopyAppliancePlacementOptions(
    isReady ? watchedProvider : undefined,
    values.resourcePool,
    false,
  );
  const canDeploy =
    isReady &&
    !options.inventoryError &&
    !options.inventoryLoading &&
    isValidCopyAppliancePlacement(values, {
      datastore: options.datastoreOptions,
      folder: options.folderOptions,
      network: options.networkOptions,
      resourcePool: options.resourcePoolOptions,
    });
  const onChange = useCallback((field: CopyApplianceSettingField, value: string): void => {
    setValues((current) => ({ ...current, [field]: value }));
  }, []);

  return {
    canDeploy,
    connection: { error, isMissing: loaded && !watchedProvider, isReady, loaded, phase },
    onChange,
    options,
    values,
  };
};
