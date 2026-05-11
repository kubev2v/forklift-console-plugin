import type { V1beta1Plan, V1beta1Provider } from '@forklift-ui/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { ConversionModel } from '@utils/crds/common/models';
import { CONCURRENCY_LIMIT } from '@utils/crds/conversion/constants';
import type { V1beta1Conversion } from '@utils/crds/conversion/types';

import { buildConversionCR } from './buildConversionCR';
import type { InspectionCreateResult, VmInspectionRef } from './types';

const INITIAL_OFFSET = 0;

const createDeepInspection = async (
  vm: VmInspectionRef,
  provider: V1beta1Provider,
  results: InspectionCreateResult,
  plan?: V1beta1Plan,
): Promise<void> => {
  try {
    const conversion = buildConversionCR({
      diskEncryption: vm.diskEncryption,
      plan,
      provider,
      vmId: vm.id,
      vmName: vm.name,
    });
    const created = await k8sCreate<V1beta1Conversion>({
      data: conversion,
      model: ConversionModel,
    });
    results.succeeded.push(created);
  } catch (error) {
    results.failed.push({ error, vmId: vm.id });
  }
};

const processChunk = async (
  vms: VmInspectionRef[],
  provider: V1beta1Provider,
  results: InspectionCreateResult,
  offset: number,
  plan?: V1beta1Plan,
): Promise<void> => {
  if (offset >= vms.length) return;

  const chunk = vms.slice(offset, offset + CONCURRENCY_LIMIT);
  await Promise.allSettled(
    chunk.map(async (vm) => createDeepInspection(vm, provider, results, plan)),
  );

  return processChunk(vms, provider, results, offset + CONCURRENCY_LIMIT, plan);
};

export const processDeepInspections = async (
  vms: VmInspectionRef[],
  provider: V1beta1Provider,
  plan?: V1beta1Plan,
): Promise<InspectionCreateResult> => {
  const results: InspectionCreateResult = { failed: [], succeeded: [] };
  await processChunk(vms, provider, results, INITIAL_OFFSET, plan);
  return results;
};
