import * as React from 'react';
import { usePollingContext } from 'legacy/src/common/context';
import { UseQueryResult } from 'react-query';
import { useMockableQuery, sortByName, getInventoryApiUrl } from './helpers';
import { MOCK_RHV_VMS, MOCK_VMWARE_VMS } from './mocks/vms.mock';
import { IdOrNameRef, SourceInventoryProvider } from './types';
import { SourceVM, IVMwareVM } from './types/vms.types';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';

type SourceVMsRecord = Record<string, SourceVM | undefined>;

export interface IndexedSourceVMs {
  vms: SourceVM[];
  vmsBySelfLink: SourceVMsRecord;
  findVMByRef: (ref: IdOrNameRef) => SourceVM | undefined;
  findVMsByRefs: (refs: IdOrNameRef[]) => SourceVM[];
  findVMsBySelfLinks: (selfLinks: string[]) => SourceVM[];
}

const findVMsInRecord = (record: SourceVMsRecord, keys: string[]) =>
  keys.flatMap((key) => (record[key] ? [record[key]] : []));

export const indexVMs = (vms: SourceVM[]): IndexedSourceVMs => {
  const sortedVMs = sortByName(vms.filter((vm) => !(vm as IVMwareVM).isTemplate));
  const vmsById: SourceVMsRecord = {};
  const vmsByName: SourceVMsRecord = {};
  const vmsBySelfLink: SourceVMsRecord = {};
  sortedVMs.forEach((vm) => {
    vmsById[vm.id] = vm;
    vmsByName[vm.name] = vm;
    vmsBySelfLink[vm.selfLink] = vm;
  });
  const findVMByRef = (ref: IdOrNameRef): SourceVM | undefined => {
    const record = ref.id ? vmsById : vmsByName;
    return record[ref.id ? ref.id : ref.name || ''];
  };
  return {
    vms: sortedVMs,
    vmsBySelfLink,
    findVMByRef,
    findVMsByRefs: (refs) =>
      refs.flatMap((ref) => {
        const vm = findVMByRef(ref);
        return (vm ? [vm] : []) as SourceVM[];
      }),
    findVMsBySelfLinks: (selfLinks) => findVMsInRecord(vmsBySelfLink, selfLinks),
  };
};

export const useSourceVMsQuery = (
  provider: SourceInventoryProvider | null
): UseQueryResult<IndexedSourceVMs> => {
  const indexVmsCallback = React.useCallback((data) => indexVMs(data), []);
  let mockVMs: SourceVM[] = [];
  if (provider?.type === 'vsphere') mockVMs = MOCK_VMWARE_VMS;
  if (provider?.type === 'ovirt') mockVMs = MOCK_RHV_VMS;
  return useMockableQuery<SourceVM[], unknown, IndexedSourceVMs>(
    {
      queryKey: ['vms', provider?.name],
      queryFn: async () =>
        await consoleFetchJSON(getInventoryApiUrl(`${provider?.selfLink || ''}/vms?detail=1`)),
      enabled: !!provider,
      refetchInterval: usePollingContext().refetchInterval,
      select: indexVmsCallback,
    },
    mockVMs
  );
};
