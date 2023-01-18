import * as React from 'react';
import * as yup from 'yup';
import { checkIfResourceExists, createResource, ForkliftResourceKind } from '@app/client/helpers';
import { IKubeList, IKubeResponse, IKubeStatus, KubeClientError } from '@app/client/types';
import { dnsLabelNameSchema } from '@app/common/constants';
import { usePollingContext } from '@app/common/context';
import { UseMutationResult, UseQueryResult, useQueryClient } from 'react-query';
import {
  mockKubeList,
  nameAndNamespace,
  useMockableMutation,
  useMockableQuery,
  sortKubeListByName,
  isSameResource,
} from './helpers';
import { MOCK_PLANS } from './mocks/plans.mock';
import { IHook, IPlan, Mapping, MappingType } from './types';
import { useAuthorizedK8sClient } from './fetchHelpers';
import { getMappingResource } from './mappings';
import { PlanWizardFormState, PlanWizardMode } from '@app/Plans/components/Wizard/PlanWizard';
import { generateHook, generateMappings, generatePlan } from '@app/Plans/components/Wizard/helpers';
import { IMetaObjectMeta } from '@app/queries/types/common.types';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';

export const usePlansQuery = (namespace: string): UseQueryResult<IKubeList<IPlan>> => {
  const planResource = createResource(ForkliftResourceKind.Plan, namespace);
  const sortKubeListByNameCallback = React.useCallback(
    (data): IKubeList<IPlan> => sortKubeListByName(data),
    []
  );

  const result = useMockableQuery<IKubeList<IPlan>>(
    {
      queryKey: 'plans',
      queryFn: async () => await consoleFetchJSON(planResource.listPath()),
      refetchInterval: usePollingContext().refetchInterval,
      select: sortKubeListByNameCallback,
    },
    mockKubeList(MOCK_PLANS, 'Plan')
  );
  return result;
};

export const useCreatePlanMutation = (
  namespace: string,
  onSuccess?: () => void
): UseMutationResult<IKubeResponse<IPlan>, KubeClientError, PlanWizardFormState, unknown> => {
  const client = useAuthorizedK8sClient();
  const queryClient = useQueryClient();
  const networkMapResource = getMappingResource(MappingType.Network, namespace).resource;
  const storageMapResource = getMappingResource(MappingType.Storage, namespace).resource;
  const hookResource = createResource(ForkliftResourceKind.Hook, namespace);
  const planResource = createResource(ForkliftResourceKind.Plan, namespace);
  return useMockableMutation<IKubeResponse<IPlan>, KubeClientError, PlanWizardFormState>(
    async (forms) => {
      await checkIfResourceExists(
        client,
        ForkliftResourceKind.Plan,
        planResource,
        forms.general.values.planName
      );

      // Create mappings with generated names and collect refs to them
      const { networkMapping, storageMapping } = generateMappings({
        forms,
        generateName: `${forms.general.values.planName}-`,
      });
      const [networkMappingRef, storageMappingRef] = (
        await Promise.all([
          networkMapping && client.create<Mapping>(networkMapResource, networkMapping),
          storageMapping && client.create<Mapping>(storageMapResource, storageMapping),
        ])
      ).map((response) => nameAndNamespace(response?.data.metadata));

      // Create hooks CRs with generated names and collect their refs
      const planHooks = forms.hooks.values.instances.map((instance) => ({
        cr: generateHook({
          instance,
          existingHook: null,
          namespace,
          generateName: `${forms.general.values.planName}-hook-`,
        }),
        instance: instance,
      }));
      const newHooksRef = planHooks.map(async (newHook) => {
        const response = await client.create<IHook>(hookResource, newHook.cr);
        return { ref: nameAndNamespace(response.data.metadata), instance: newHook.instance };
      });

      const hooksRef = await Promise.all(newHooksRef);

      // Create plan referencing new mappings and new hooks for plan's VMs
      const planResponse = await client.create<IPlan>(
        planResource,
        generatePlan(forms, networkMappingRef, storageMappingRef, namespace, hooksRef)
      );

      // Patch mappings with ownerReferences to new plan
      const { networkMapping: networkMapWithOwnerRef, storageMapping: storageMapWithOwnerRef } =
        generateMappings({
          forms,
          owner: planResponse?.data,
        });
      if (networkMapWithOwnerRef && storageMapWithOwnerRef) {
        await Promise.all([
          client.patch<Mapping>(networkMapResource, networkMappingRef.name, networkMapWithOwnerRef),
          client.patch<Mapping>(storageMapResource, storageMappingRef.name, storageMapWithOwnerRef),
        ]);
      }

      // Patch hooks with ownerReferences to the new plan
      const hooksWithOwnerRef = hooksRef.map((hook) =>
        generateHook({
          instance: hook.instance,
          existingHook: hook.ref,
          namespace,
          generateName: '',
          owner: planResponse?.data,
        })
      );
      const newHooksWithOwnerRef = hooksWithOwnerRef.map(async (hookWithOwnerRef) => {
        const response = await client.patch<IHook>(
          hookResource,
          (hookWithOwnerRef.metadata as IMetaObjectMeta).name,
          hookWithOwnerRef
        );
        return response;
      });
      await Promise.all(newHooksWithOwnerRef);

      return planResponse;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('plans');
        queryClient.invalidateQueries('mappings');
        queryClient.invalidateQueries('hooks');
        onSuccess && onSuccess();
      },
    }
  );
};

interface IPatchPlanArgs {
  planBeingEdited: IPlan;
  forms: PlanWizardFormState;
}

export const usePatchPlanMutation = (
  namespace: string,
  onSuccess?: () => void
): UseMutationResult<IKubeResponse<IPlan>, KubeClientError, IPatchPlanArgs, unknown> => {
  const client = useAuthorizedK8sClient();
  const queryClient = useQueryClient();
  const networkMapResource = getMappingResource(MappingType.Network, namespace).resource;
  const storageMapResource = getMappingResource(MappingType.Storage, namespace).resource;
  const hookResource = createResource(ForkliftResourceKind.Hook, namespace);
  const planResource = createResource(ForkliftResourceKind.Plan, namespace);

  return useMockableMutation<IKubeResponse<IPlan>, KubeClientError, IPatchPlanArgs>(
    async ({ planBeingEdited, forms }) => {
      const { networkMapping, storageMapping } = generateMappings({
        forms,
        owner: planBeingEdited,
      });
      const { network: networkMappingRef, storage: storageMappingRef } = planBeingEdited.spec.map;

      // Add or update hooks
      const planHooks = forms.hooks.values.instances.map((instance) => {
        if (instance.prefilledFromHook) {
          return {
            cr: generateHook({
              instance,
              existingHook: nameAndNamespace(instance.prefilledFromHook.metadata),
              namespace,
              generateName: `${forms.general.values.planName}-hook-`,
            }),
            existingHook: true,
            instance: instance,
          };
        }
        return {
          cr: generateHook({
            instance,
            existingHook: null,
            namespace,
            generateName: `${forms.general.values.planName}-hook-`,
          }),
          existingHook: false,
          instance: instance,
        };
      });

      const updatedHooksRef = planHooks.map(async (hook) => {
        if (hook.existingHook) {
          const response = await client.patch<IHook>(
            hookResource,
            (hook.cr.metadata as IMetaObjectMeta).name,
            hook.cr
          );
          return { ref: nameAndNamespace(response.data.metadata), instance: hook.instance };
        }
        const response = await client.create<IHook>(hookResource, hook.cr);
        return { ref: nameAndNamespace(response.data.metadata), instance: hook.instance };
      });

      const hooksRef = await Promise.all(updatedHooksRef);

      const updatedPlan = generatePlan(
        forms,
        networkMappingRef,
        storageMappingRef,
        namespace,
        hooksRef
      );
      const [, , planResponse] = await Promise.all([
        networkMapping &&
          client.patch<Mapping>(networkMapResource, networkMappingRef.name, networkMapping),
        storageMapping &&
          client.patch<Mapping>(storageMapResource, storageMappingRef.name, storageMapping),

        client.patch<IPlan>(planResource, planBeingEdited.metadata.name, updatedPlan),
      ]);

      // Patch new hooks with ownerReferences to the edited plan
      const hooksWithOwnerRef: IHook[] = [];
      for (let i = 0; i < hooksRef.length; i++) {
        if (!hooksRef[i].instance.prefilledFromHook) {
          hooksWithOwnerRef.push(
            generateHook({
              instance: hooksRef[i].instance,
              existingHook: hooksRef[i].ref,
              namespace,
              generateName: '',
              owner: planBeingEdited,
            })
          );
        }
      }
      const newHooksWithOwnerRef = hooksWithOwnerRef.map(async (hookWithOwnerRef) => {
        const response = await client.patch<IHook>(
          hookResource,
          (hookWithOwnerRef.metadata as IMetaObjectMeta).name,
          hookWithOwnerRef
        );
        return response;
      });
      await Promise.all(newHooksWithOwnerRef);

      // Delete hooks removed from plan
      const planHooksToDelete = planBeingEdited.spec.vms[0].hooks?.filter(
        (vmsHook) =>
          !forms.hooks.values.instances.find((instance) =>
            isSameResource(instance.prefilledFromHook?.metadata, vmsHook.hook)
          )
      );

      const deleteHooks = planHooksToDelete?.map(async (hook) => {
        const response = client.delete(hookResource, hook.hook.name);
        return response;
      });
      if (deleteHooks) await Promise.all(deleteHooks);

      return planResponse;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('plans');
        queryClient.invalidateQueries('hooks');
        queryClient.invalidateQueries('mappings');
        onSuccess && onSuccess();
      },
    }
  );
};

export const useDeletePlanMutation = (
  namespace: string,
  onSuccess?: () => void
): UseMutationResult<IKubeResponse<IKubeStatus>, KubeClientError, IPlan, unknown> => {
  const client = useAuthorizedK8sClient();
  const planResource = createResource(ForkliftResourceKind.Plan, namespace);
  const queryClient = useQueryClient();
  return useMockableMutation<IKubeResponse<IKubeStatus>, KubeClientError, IPlan>(
    (plan: IPlan) => client.delete(planResource, plan.metadata.name),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('plans');
        queryClient.invalidateQueries('mappings');
        onSuccess && onSuccess();
      },
    }
  );
};

export const useArchivePlanMutation = (
  namespace: string,
  onSuccess?: () => void
): UseMutationResult<IKubeResponse<IKubeStatus>, KubeClientError, IPlan, unknown> => {
  const client = useAuthorizedK8sClient();
  const queryClient = useQueryClient();
  const planResource = createResource(ForkliftResourceKind.Plan, namespace);
  return useMockableMutation<IKubeResponse<IKubeStatus>, KubeClientError, IPlan>(
    (plan: IPlan) => {
      const planWithArchiveFlag: IPlan = {
        ...plan,
        spec: {
          ...plan.spec,
          archived: true,
        },
      };

      return client.patch(planResource, plan.metadata.name, planWithArchiveFlag);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('plans');
        onSuccess && onSuccess();
      },
    }
  );
};

export const getPlanNameSchema = (
  plansQuery: UseQueryResult<IKubeList<IPlan>>,
  planBeingPrefilled: IPlan | null,
  wizardMode: PlanWizardMode
): yup.StringSchema =>
  dnsLabelNameSchema
    .test('unique-name', 'A plan with this name already exists', (value) => {
      if (wizardMode === 'edit' && planBeingPrefilled?.metadata.name === value) return true;
      if (plansQuery.data?.items.find((plan) => plan.metadata.name === value)) return false;
      return true;
    })
    .test(
      'non-reserved-name',
      'This name is reserved due to a path conflict and cannot be used',
      (value) => value !== 'create'
    );
