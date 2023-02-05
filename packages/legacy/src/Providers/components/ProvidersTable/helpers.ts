import { ProviderType } from 'legacy/src/common/constants';
import { hasCondition } from 'legacy/src/common/helpers';
import { isSameResource } from 'legacy/src/queries/helpers';
import {
  InventoryProvider,
  ICorrelatedProvider,
  IProviderObject,
  IPlan,
  INameNamespaceRef,
} from 'legacy/src/queries/types';

/**
 * @deprecated
 */
export const correlateProviders = <T extends InventoryProvider>(
  clusterProviders: IProviderObject[],
  inventoryProviders: T[],
  providerType: ProviderType
): ICorrelatedProvider<T>[] =>
  clusterProviders
    .filter((provider) => provider.spec.type === providerType)
    .map((provider) => ({
      ...provider,
      inventory:
        inventoryProviders.find((inventoryProvider) =>
          isSameResource(inventoryProvider, provider.metadata)
        ) || null,
    }));

export const hasRunningMigration = ({
  plans = [],
  providerMetadata,
}: {
  plans: IPlan[];
  providerMetadata: INameNamespaceRef;
}): boolean =>
  !!plans
    .filter((plan) => hasCondition(plan.status?.conditions || [], 'Executing'))
    .find((runningPlan) => {
      const { source, destination } = runningPlan.spec.provider;
      return (
        isSameResource(providerMetadata, source) || isSameResource(providerMetadata, destination)
      );
    });
