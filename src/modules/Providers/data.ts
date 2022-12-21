import { useMemo } from 'react';
import { groupVersionKindForObj } from '_/utils/resources';
import * as C from 'src/utils/constants';
import { useProviders } from 'src/utils/fetch';
import { Condition, ProviderResource } from 'src/utils/types';

import { useInventoryProvidersQuery } from '@app/queries';
import {
  IOpenShiftProvider,
  IProvidersByType,
  IRHVProvider,
  IVMwareProvider,
} from '@app/queries/types';
import { K8sGroupVersionKind } from '@openshift-console/dynamic-plugin-sdk';

const conditionState = (state: string) =>
  state === 'True' || state === 'False' ? state : 'Unknown';

interface SupportedCondition {
  status: string;
  message: string;
}

interface PositiveConditions {
  Ready?: SupportedCondition;
  Validated?: SupportedCondition;
  ConnectionTestSucceeded?: SupportedCondition;
  InventoryCreated?: SupportedCondition;
  LoadInventory?: SupportedCondition;
}
interface NegativeConditions {
  URLNotValid?: SupportedCondition;
  ProviderTypeNotSupported?: SupportedCondition;
  SecretNotValid?: SupportedCondition;
  SettingsNotValid?: SupportedCondition;
  ConnectionTestFailed?: SupportedCondition;
}

export type SupportedConditions = PositiveConditions & NegativeConditions;

export interface MergedProvider {
  [C.NAME]: string;
  [C.NAMESPACE]: string;
  [C.URL]: string;
  [C.TYPE]: string;
  [C.UID]: string;
  [C.SECRET_NAME]: string;
  [C.GVK]: K8sGroupVersionKind;
  [C.DEFAULT_TRANSFER_NETWORK]: string;
  [C.CLUSTER_COUNT]: number;
  [C.HOST_COUNT]: number;
  [C.VM_COUNT]: number;
  [C.NETWORK_COUNT]: number;
  [C.STORAGE_COUNT]: number;
  [C.READY]: string;
  positiveConditions: PositiveConditions;
  negativeConditions: NegativeConditions;
}

// may be empty when there is no inventory (yet)
type FlattenedInventory = Partial<IVMwareProvider & IRHVProvider & IOpenShiftProvider>;

export const groupPairs = (
  resources: ProviderResource[],
  inventory: IProvidersByType,
): [ProviderResource, FlattenedInventory][] => {
  const uid2inventory: { [key: string]: FlattenedInventory } = Object.fromEntries(
    Object.values(inventory)
      .flat()
      .map((inventory) => [inventory?.uid, inventory])
      .filter(([uid, inventory]) => uid && inventory),
  );

  return resources
    .filter(Boolean)
    .map((resource): [string, ProviderResource] => [resource?.metadata?.uid, resource])
    .filter(([uid, resource]) => uid && resource)
    .map(([uid, resource]): [ProviderResource, FlattenedInventory] => [
      resource,
      uid2inventory[uid] ?? {},
    ]);
};

export const mergeData = (pairs: [ProviderResource, FlattenedInventory][]) =>
  pairs
    .map(
      ([resource, inventory]): [
        ProviderResource,
        K8sGroupVersionKind,
        FlattenedInventory,
        SupportedConditions,
      ] => [
        resource,
        groupVersionKindForObj(resource),
        inventory,
        toSupportedConditions(resource.status?.conditions ?? []),
      ],
    )
    .map(
      ([
        {
          metadata: { name = '', namespace = '', uid = '', annotations = [] } = {},
          spec: { url = '', type = '', secret: { name: secretName = '' } = {} } = {},
        },
        gvk,
        { clusterCount, hostCount, vmCount, networkCount, datastoreCount, storageDomainCount },
        {
          Ready,
          Validated,
          ConnectionTestSucceeded,
          ConnectionTestFailed,
          InventoryCreated,
          LoadInventory,
          URLNotValid,
          ProviderTypeNotSupported,
          SecretNotValid,
          SettingsNotValid,
        },
      ]): MergedProvider => ({
        name,
        namespace,
        url,
        type,
        uid,
        gvk,
        secretName,
        defaultTransferNetwork: annotations?.[C.DEFAULT_TRANSFER_NETWORK_ANNOTATION],
        clusterCount,
        hostCount,
        vmCount,
        networkCount,
        storageCount: storageDomainCount ?? datastoreCount,
        ready: Ready?.status ?? 'Unknown',
        positiveConditions: {
          Ready,
          InventoryCreated,
          Validated,
          ConnectionTestSucceeded,
          LoadInventory,
        },
        negativeConditions: {
          ConnectionTestFailed,
          URLNotValid,
          ProviderTypeNotSupported,
          SecretNotValid,
          SettingsNotValid,
        },
      }),
    );

export const toSupportedConditions = (conditions: Condition[]) =>
  conditions.reduce(
    (acc: SupportedConditions, { type, status, message }) => ({
      ...acc,
      [type]: { status: conditionState(status), message },
    }),
    {},
  );

export const useProvidersWithInventory = ({
  namespace,
  name = undefined,
  groupVersionKind: { group, version },
}): [MergedProvider[], boolean, boolean] => {
  const [resources, loaded, error] = useProviders({ namespace, name }, { group, version });
  const { data, isSuccess, isError } = useInventoryProvidersQuery();
  const providersWithInventory = useMemo(
    () => (resources && data ? mergeData(groupPairs(resources, data)) : []),
    [resources, data],
  );

  const totalSuccess = loaded && isSuccess;
  const totalError = error || isError;
  // extra memo to keep the tuple reference stable
  // the tuple is used as data source and passed as prop
  // which triggres unnecessary re-renders
  return useMemo(
    () => [providersWithInventory, totalSuccess, totalError],
    [providersWithInventory, totalSuccess, totalError],
  );
};
