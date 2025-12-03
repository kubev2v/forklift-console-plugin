import type { V1beta1NetworkMap, V1beta1StorageMap } from '@kubev2v/types';

export const getMapSourceProviderName = (map: V1beta1NetworkMap | V1beta1StorageMap) =>
  map?.spec?.provider?.source?.name;

export const getMapDestinationProviderName = (map: V1beta1NetworkMap | V1beta1StorageMap) =>
  map?.spec?.provider?.destination?.name;

export const getMapSourceProviderNamespace = (map: V1beta1NetworkMap | V1beta1StorageMap) =>
  map?.spec?.provider?.source?.namespace;

export const getMapDestinationProviderNamespace = (map: V1beta1NetworkMap | V1beta1StorageMap) =>
  map?.spec?.provider?.destination?.namespace;
