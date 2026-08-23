import { useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { getStorageMapFieldId } from 'src/storageMaps/utils/getStorageMapFieldId';
import { deriveMatchStatus, deriveSuggestedProduct } from 'src/storageMaps/utils/offloadMatchUtils';
import { validateOffloadFields } from 'src/storageMaps/utils/validateOffloadFields';

import { isEmpty } from '@utils/helpers';
import { StorageMapFieldId, type StorageMapping } from '@utils/storage/types';

import { useStorageVendorProducts } from '../../../hooks/useStorageVendorProducts';
import {
  type OffloadMatchStatus,
  OffloadPlugin,
  type StorageVendorProduct,
} from '../../../utils/types';
import { resolveProductFromCsiProvisioner } from '../../../utils/vendorLookupTables';

import { useRevalidateStorageMap } from './useRevalidateStorageMap';

type UseOffloadStorageFormStateArgs = {
  datastoreVendor?: StorageVendorProduct;
  index: number;
  targetProvisioner?: string;
};

type UseOffloadStorageFormStateReturn = {
  clearOffloadFields: () => void;
  hasAnyOffloadValue: boolean;
  hostsFieldId: string;
  matchStatus: OffloadMatchStatus;
  offloadError: string | undefined;
  offloadPlugin: OffloadPlugin | '' | undefined;
  pluginFieldId: string;
  productFieldId: string;
  resolvedSuggestedProduct: StorageVendorProduct | undefined;
  secretFieldId: string;
};

export const useOffloadStorageFormState = ({
  datastoreVendor,
  index,
  targetProvisioner,
}: UseOffloadStorageFormStateArgs): UseOffloadStorageFormStateReturn => {
  const { control, setValue } = useFormContext();

  const pluginFieldId = getStorageMapFieldId(StorageMapFieldId.OffloadPlugin, index);
  const secretFieldId = getStorageMapFieldId(StorageMapFieldId.StorageSecret, index);
  const productFieldId = getStorageMapFieldId(StorageMapFieldId.StorageProduct, index);
  const hostsFieldId = getStorageMapFieldId(StorageMapFieldId.DedicatedMigrationHosts, index);

  const [offloadPlugin, storageSecret, storageProduct, dedicatedMigrationHosts] = useWatch({
    control,
    name: [pluginFieldId, secretFieldId, productFieldId, hostsFieldId],
  }) as [
    OffloadPlugin | '' | undefined,
    string | undefined,
    string | undefined,
    string[] | undefined,
  ];

  const { storageVendorProducts } = useStorageVendorProducts(offloadPlugin);

  const hasAnyOffloadValue =
    Boolean(offloadPlugin) || Boolean(storageSecret) || Boolean(storageProduct);

  const storageClassVendor = useMemo(
    () => (targetProvisioner ? resolveProductFromCsiProvisioner(targetProvisioner) : undefined),
    [targetProvisioner],
  );

  const suggestedProduct = useMemo(
    () => deriveSuggestedProduct(datastoreVendor, storageClassVendor),
    [datastoreVendor, storageClassVendor],
  );

  const resolvedSuggestedProduct = useMemo((): StorageVendorProduct | undefined => {
    if (!suggestedProduct) {
      return undefined;
    }

    if (!storageVendorProducts.includes(suggestedProduct)) {
      return undefined;
    }

    return suggestedProduct;
  }, [storageVendorProducts, suggestedProduct]);

  const matchStatus = useMemo(
    (): OffloadMatchStatus =>
      deriveMatchStatus(
        datastoreVendor,
        storageClassVendor,
        storageProduct as StorageVendorProduct | undefined,
      ),
    [datastoreVendor, storageClassVendor, storageProduct],
  );

  const offloadError = useMemo((): string | undefined => {
    const mapping = {
      [StorageMapFieldId.OffloadPlugin]: offloadPlugin ?? '',
      [StorageMapFieldId.SourceStorage]: { name: '' },
      [StorageMapFieldId.StorageProduct]: storageProduct ?? '',
      [StorageMapFieldId.StorageSecret]: storageSecret ?? '',
      [StorageMapFieldId.TargetStorage]: { name: '' },
    } satisfies StorageMapping;

    return validateOffloadFields(mapping);
  }, [offloadPlugin, storageProduct, storageSecret]);

  useRevalidateStorageMap(offloadPlugin, storageSecret, storageProduct);

  useEffect(() => {
    if (
      storageProduct &&
      !isEmpty(storageVendorProducts) &&
      !storageVendorProducts.includes(storageProduct)
    ) {
      setValue(productFieldId, '', { shouldDirty: true, shouldValidate: true });
    }

    if (
      offloadPlugin &&
      offloadPlugin !== OffloadPlugin.VSphereXcopyConfig &&
      !isEmpty(dedicatedMigrationHosts)
    ) {
      setValue(hostsFieldId, [], { shouldDirty: true, shouldValidate: true });
    }
  }, [
    dedicatedMigrationHosts,
    hostsFieldId,
    offloadPlugin,
    productFieldId,
    setValue,
    storageProduct,
    storageVendorProducts,
  ]);

  const clearOffloadFields = (): void => {
    setValue(pluginFieldId, '', { shouldDirty: true, shouldValidate: true });
    setValue(secretFieldId, '', { shouldDirty: true, shouldValidate: true });
    setValue(productFieldId, '', { shouldDirty: true, shouldValidate: true });
    setValue(hostsFieldId, [], { shouldDirty: true, shouldValidate: true });
  };

  return {
    clearOffloadFields,
    hasAnyOffloadValue,
    hostsFieldId,
    matchStatus,
    offloadError,
    offloadPlugin,
    pluginFieldId,
    productFieldId,
    resolvedSuggestedProduct,
    secretFieldId,
  };
};
