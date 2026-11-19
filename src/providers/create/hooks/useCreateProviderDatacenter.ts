import { useCallback, useState } from 'react';
import { buildProviderSettingPatch } from 'src/providers/utils/settings/buildProviderSettingPatch';
import { getDatacenterNames } from 'src/providers/utils/vsphere/datacenter';

import { ProviderModel, type V1beta1Provider } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { getVSphereDatacenter } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import useProviderInventory from '@utils/hooks/useProviderInventory';

const DATACENTER_SETTING_KEY = 'datacenter';

type DatacenterInventoryItem = {
  name: string;
};

export type CreateProviderDatacenter = {
  error: Error | null;
  inventoryError: Error | null;
  isInventoryLoading: boolean;
  isPending: boolean;
  names: string[];
  onSelect: (value: string) => void;
  value: string;
};

export const useCreateProviderDatacenter = (
  provider: V1beta1Provider | undefined,
  requiresDatacenter: boolean,
): CreateProviderDatacenter => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const providerValue = provider ? (getVSphereDatacenter(provider) ?? '') : undefined;
  const [syncedProviderValue, setSyncedProviderValue] = useState(providerValue);

  const {
    error: inventoryError,
    inventory,
    loading: isInventoryLoading,
  } = useProviderInventory<DatacenterInventoryItem[]>({
    disabled: !provider,
    provider,
    subPath: 'datacenters?detail=1',
  });

  if (providerValue !== undefined && providerValue !== syncedProviderValue) {
    setSyncedProviderValue(providerValue);
    setValue(providerValue);
  }

  const patchDatacenter = useCallback(
    async (nextValue: string): Promise<void> => {
      if (!provider) {
        return;
      }

      const patches = buildProviderSettingPatch(provider, DATACENTER_SETTING_KEY, nextValue);

      if (isEmpty(patches)) {
        return;
      }

      setIsSaving(true);
      setError(null);

      try {
        await k8sPatch({ data: patches, model: ProviderModel, resource: provider });
      } catch (patchError) {
        setError(patchError as Error);
        setValue(getVSphereDatacenter(provider) ?? '');
      } finally {
        setIsSaving(false);
      }
    },
    [provider],
  );

  const onSelect = useCallback(
    (selected: string): void => {
      const nextValue = selected.trim();

      if ((requiresDatacenter && isEmpty(nextValue)) || nextValue === value) {
        return;
      }

      setValue(nextValue);
      setError(null);
      patchDatacenter(nextValue).catch(() => undefined);
    },
    [patchDatacenter, requiresDatacenter, value],
  );

  return {
    error,
    inventoryError,
    isInventoryLoading,
    isPending: isSaving,
    names: getDatacenterNames(inventory),
    onSelect,
    value,
  };
};
