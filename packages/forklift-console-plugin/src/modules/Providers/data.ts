import { useMemo } from 'react';
import * as C from 'src/utils/constants';
import { useProviders } from 'src/utils/fetch';
import { groupVersionKindForObj } from 'src/utils/resources';
import { ProviderStatus } from 'src/utils/types';

import { useInventoryProvidersQuery } from '@kubev2v/legacy/queries';
import {
  IOpenShiftProvider,
  IProviderObject,
  IProvidersByType,
  IRHVProvider,
  IVMwareProvider,
} from '@kubev2v/legacy/queries/types';
import { V1beta1Provider, V1beta1ProviderStatusConditions } from '@kubev2v/types';
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
  [C.PHASE]: ProviderStatus;
  positiveConditions: PositiveConditions;
  negativeConditions: NegativeConditions;
  object: IProviderObject;
  selfLink: string;
}

// may be empty when there is no inventory (yet)
type FlattenedInventory = Partial<IVMwareProvider & IRHVProvider & IOpenShiftProvider>;

export const groupPairs = (
  resources: V1beta1Provider[],
  inventory: IProvidersByType,
): [V1beta1Provider, FlattenedInventory][] => {
  const uid2inventory: { [key: string]: FlattenedInventory } = Object.fromEntries(
    Object.values(inventory)
      .flat()
      .map((inventory) => [inventory?.uid, inventory])
      .filter(([uid, inventory]) => uid && inventory),
  );

  return resources
    .filter(Boolean)
    .map((resource): [string, V1beta1Provider] => [resource?.metadata?.uid, resource])
    .filter(([uid, resource]) => uid && resource)
    .map(([uid, resource]): [V1beta1Provider, FlattenedInventory] => [
      resource,
      uid2inventory[uid] ?? {},
    ]);
};

export const mergeData = (pairs: [V1beta1Provider, FlattenedInventory][]) =>
  pairs
    .map(
      ([resource, inventory]): [
        V1beta1Provider,
        V1beta1Provider,
        K8sGroupVersionKind,
        FlattenedInventory,
        SupportedConditions,
      ] => [
        resource,
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
          status: { phase = 'Unknown' } = {},
        },
        provider,
        gvk,
        {
          clusterCount,
          hostCount,
          vmCount,
          networkCount,
          datastoreCount,
          storageDomainCount,
          selfLink,
        },
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
        object: provider as IProviderObject,
        selfLink,
        phase: phase as ProviderStatus,
      }),
    );

export const toSupportedConditions = (conditions: V1beta1ProviderStatusConditions[]) =>
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
