import React from 'react';
import { PlanEditAction } from 'src/modules/Plans/utils/types/PlanEditAction';
import { PlanEditPage } from 'src/modules/Plans/views/edit/PlanEditPage';
import { useModal } from 'src/modules/Providers/modals';
import { useInventoryVms, VmData } from 'src/modules/Providers/views';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  NetworkMapModelGroupVersionKind,
  ProviderModelGroupVersionKind,
  StorageMapModelGroupVersionKind,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1PlanSpecVms,
  V1beta1Provider,
  V1beta1StorageMap,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Modal, ModalVariant } from '@patternfly/react-core';

import './PlanVMsDeleteModal.style.css';
import './PlanVMsEditModal.style.css';

export interface PlanVMsEditModalProps {
  plan: V1beta1Plan;
  editAction: PlanEditAction;
}

export const PlanVMsEditModal: React.FC<PlanVMsEditModalProps> = ({ plan, editAction }) => {
  const { toggleModal } = useModal();
  const { t } = useForkliftTranslation();
  const projectName = plan?.metadata?.namespace;

  // Retrieve k8s source provider
  const [sourceProvider, sourceProviderLoaded, sourceProviderLoadError] =
    useK8sWatchResource<V1beta1Provider>({
      groupVersionKind: ProviderModelGroupVersionKind,
      namespaced: true,
      name: plan?.spec?.provider?.source?.name,
      namespace: plan?.spec?.provider?.source?.namespace,
    });

  // Retrieve k8s target provider
  const [targetProvider, targetProviderLoaded, targetProviderLoadError] =
    useK8sWatchResource<V1beta1Provider>({
      groupVersionKind: ProviderModelGroupVersionKind,
      namespaced: true,
      name: plan?.spec?.provider?.destination?.name,
      namespace: plan?.spec?.provider?.destination?.namespace,
    });

  const [providers, providersLoaded, providersLoadError] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace: plan?.metadata?.namespace,
  });

  // Retrieve all k8s Network Mappings
  const [networkMaps, networkMapsLoaded, networkMapsError] = useK8sWatchResource<
    V1beta1NetworkMap[]
  >({
    groupVersionKind: NetworkMapModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace: plan?.metadata?.namespace,
  });

  // Retrieve all k8s Storage Mappings
  const [storageMaps, storageMapsLoaded, storageMapsError] = useK8sWatchResource<
    V1beta1StorageMap[]
  >({
    groupVersionKind: StorageMapModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace: plan?.metadata?.namespace,
  });

  const [vmData] = useInventoryVms(
    { provider: sourceProvider },
    sourceProviderLoaded,
    sourceProviderLoadError,
  );
  const selectedVMs: VmData[] = [];
  const notFoundPlanVMs: V1beta1PlanSpecVms[] = [];
  plan.spec.vms.forEach((planVm) => {
    const providerVm = vmData.find((vm) => vm.vm.id === planVm.id);
    if (providerVm) {
      selectedVMs.push(providerVm);
    } else {
      // Edge case: plan VM not found in list of provider VMs
      notFoundPlanVMs.push(planVm);
    }
  });

  const planNetworkMaps = networkMaps
    ? networkMaps.find((net) => net?.metadata?.name === plan?.spec?.map?.network?.name)
    : null;
  const planStorageMaps = storageMaps
    ? storageMaps.find((storage) => storage?.metadata?.name === plan.spec.map?.storage?.name)
    : null;

  const finishedLoading =
    providersLoaded &&
    sourceProviderLoaded &&
    targetProviderLoaded &&
    networkMapsLoaded &&
    storageMapsLoaded &&
    vmData.length > 0;
  const hasErrors =
    providersLoadError ||
    sourceProviderLoadError ||
    targetProviderLoadError ||
    networkMapsError ||
    storageMapsError;

  return (
    <Modal
      position="top"
      showClose={false}
      variant={ModalVariant.large}
      isOpen={true}
      hasNoBodyWrapper
      className="forklift-edit-modal"
      disableFocusTrap
    >
      {hasErrors && (
        <div>
          <span className="text-muted">
            {t(
              'Something is wrong, the data was not loaded due to an error, please try to reload the page.',
            )}
          </span>
        </div>
      )}
      {!hasErrors && finishedLoading ? (
        <PlanEditPage
          plan={plan}
          projectName={projectName}
          providers={providers}
          sourceProvider={sourceProvider}
          targetProvider={targetProvider}
          editAction={editAction}
          onClose={toggleModal}
          selectedVMs={selectedVMs}
          notFoundPlanVMs={notFoundPlanVMs}
          planNetworkMaps={planNetworkMaps}
          planStorageMaps={planStorageMaps}
        />
      ) : (
        <div>
          <span className="text-muted">{t('Data is loading, please wait.')}</span>
        </div>
      )}
    </Modal>
  );
};
