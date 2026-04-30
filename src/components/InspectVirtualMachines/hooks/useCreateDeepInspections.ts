import { useCallback } from 'react';

import type { V1beta1Plan, V1beta1Provider } from '@forklift-ui/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { ConversionModel } from '@utils/crds/common/models';
import type { V1beta1Conversion } from '@utils/crds/conversion/types';

import { buildConversionCR } from '../utils/buildConversionCR';
import type { InspectionCreateResult } from '../utils/types';

type VmRef = {
  id: string;
  name: string;
};

type UseCreateDeepInspectionsParams = {
  plan: V1beta1Plan;
  provider: V1beta1Provider;
};

type CreateInspectionsFn = (vms: VmRef[]) => Promise<InspectionCreateResult>;

export const useCreateDeepInspections = ({
  plan,
  provider,
}: UseCreateDeepInspectionsParams): CreateInspectionsFn => {
  return useCallback(
    async (vms: VmRef[]): Promise<InspectionCreateResult> => {
      const results: InspectionCreateResult = { failed: [], succeeded: [] };

      const promises = vms.map(async (vm) => {
        try {
          const conversion = buildConversionCR({
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
      });

      await Promise.allSettled(promises);
      return results;
    },
    [plan, provider],
  );
};
