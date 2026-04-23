import { useMemo } from 'react';

import type { V1beta1Provider } from '@forklift-ui/types';
import useProviderInventory from '@utils/hooks/useProviderInventory';

import type { StorageVendorProduct } from '../utils/types';
import {
  type DatastoreWithBacking,
  type HostScsiDisk,
  resolveProductFromDatastore,
} from '../utils/vendorLookupTables';

type InventoryHost = {
  hostScsiDisks?: HostScsiDisk[];
};

const HOST_INVENTORY_INTERVAL_MS = 180000;

type UseDatastoreVendorResult = {
  datastoreVendor: StorageVendorProduct | undefined;
  loading: boolean;
};

/**
 * Resolves the StorageVendorProduct for a datastore by fetching host inventory
 * and correlating backing device names with Host SCSI disk canonical names.
 */
export const useDatastoreVendor = (
  sourceProvider: V1beta1Provider | undefined,
  datastore: DatastoreWithBacking | undefined,
): UseDatastoreVendorResult => {
  const hasBackingDevices = Boolean(datastore?.backingDevicesNames?.length);

  const { inventory: hosts, loading } = useProviderInventory<InventoryHost[]>({
    disabled: !sourceProvider || !hasBackingDevices,
    interval: HOST_INVENTORY_INTERVAL_MS,
    provider: sourceProvider,
    subPath: 'hosts?detail=4',
  });

  const allScsiDisks = useMemo((): HostScsiDisk[] => {
    if (!hosts?.length) {
      return [];
    }

    return hosts.flatMap((host) => host.hostScsiDisks ?? []);
  }, [hosts]);

  const datastoreVendor = useMemo(
    (): StorageVendorProduct | undefined => resolveProductFromDatastore(datastore, allScsiDisks),
    [allScsiDisks, datastore],
  );

  return { datastoreVendor, loading };
};
