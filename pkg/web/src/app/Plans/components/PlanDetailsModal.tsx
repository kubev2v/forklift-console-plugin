import * as React from 'react';

import {
  IHook,
  IMetaObjectMeta,
  IPlan,
  MappingType,
  SourceInventoryProvider,
} from '@app/queries/types';
import {
  useInventoryProvidersQuery,
  useMappingsQuery,
  useResourceQueriesForMapping,
  useHooksQuery,
  useSourceVMsQuery,
} from '@app/queries';
import { usePausedPollingEffect } from '@app/common/context';
import { ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { isSameResource } from '@app/queries/helpers';
import { PlanDetails } from './PlanDetails';
import { SOURCE_PROVIDER_TYPES } from '@app/common/constants';

interface IPlanDetailsModalProps {
  plan: IPlan;
}

export const PlanDetailsModal: React.FunctionComponent<IPlanDetailsModalProps> = ({
  plan,
}: IPlanDetailsModalProps) => {
  usePausedPollingEffect();
  const namespace = plan.metadata.namespace;
  const networkMappingsQuery = useMappingsQuery(MappingType.Network, namespace);
  const networkMapping =
    networkMappingsQuery.data?.items.find((mapping) =>
      isSameResource(mapping.metadata as IMetaObjectMeta, plan.spec.map.network)
    ) || null;

  const storageMappingsQuery = useMappingsQuery(MappingType.Storage, namespace);
  const storageMapping =
    storageMappingsQuery.data?.items.find((mapping) =>
      isSameResource(mapping.metadata as IMetaObjectMeta, plan.spec.map.storage)
    ) || null;

  const providersQuery = useInventoryProvidersQuery();
  const allProviders = providersQuery.data
    ? (SOURCE_PROVIDER_TYPES.flatMap(
        (key) => providersQuery.data[key]
      ) as SourceInventoryProvider[])
    : [];
  const provider =
    allProviders.find((provider) => isSameResource(provider, plan.spec.provider.source)) || null;

  const vmsQuery = useSourceVMsQuery(provider);
  const selectedVMs = vmsQuery.data?.findVMsByRefs(plan.spec.vms) || [];

  const hooksQuery = useHooksQuery(namespace);
  const selectedHooks =
    hooksQuery.data?.items.filter((hook) =>
      plan.spec.vms.find((vm) =>
        vm.hooks?.find(
          (VMHook) =>
            VMHook.hook.name === (hook.metadata as IMetaObjectMeta).name &&
            VMHook.hook.namespace === (hook.metadata as IMetaObjectMeta).namespace
        )
      )
    ) || [];

  const isPlaybook = (hooks: IHook[], name: string): boolean => {
    const hook = hooks.find((hook) => (hook.metadata as IMetaObjectMeta).name === name);
    return hook?.spec.playbook ? true : false;
  };

  const networkMappingResources = useResourceQueriesForMapping(MappingType.Network, networkMapping);
  const storageMappingResources = useResourceQueriesForMapping(MappingType.Storage, storageMapping);
  const mappingResourceQueryErrors = [
    'Cannot load providers',
    'Cannot load source provider resources',
    'Cannot load target provider resources',
  ];

  return (
    <ResolvedQueries
      results={[
        networkMappingsQuery,
        storageMappingsQuery,
        providersQuery,
        vmsQuery,
        ...networkMappingResources.queries,
        ...storageMappingResources.queries,
      ]}
      errorTitles={[
        'Cannot load network mappings',
        'Cannot load storage mappings',
        'Cannot load providers',
        'Cannot load VMs',
        ...mappingResourceQueryErrors,
        ...mappingResourceQueryErrors,
      ]}
    >
      <PlanDetails
        plan={plan}
        sourceProvider={provider}
        networkMapping={networkMapping}
        storageMapping={storageMapping}
        vms={selectedVMs}
        hooksDetails={
          plan.spec.vms[0].hooks?.map((hook) => ({
            step: hook.step,
            playbook: isPlaybook(selectedHooks, hook.hook.name),
          })) || null
        }
      />
    </ResolvedQueries>
  );
};
