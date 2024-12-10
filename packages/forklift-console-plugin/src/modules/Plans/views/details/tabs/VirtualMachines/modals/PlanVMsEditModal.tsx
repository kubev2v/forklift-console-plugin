import React from 'react';
import { PlanEditPage } from 'src/modules/Plans/views/create/PlanEditPage';
import { useModal } from 'src/modules/Providers/modals';
import { useInventoryVms } from 'src/modules/Providers/views';
import { useForkliftTranslation } from 'src/utils/i18n';

// import { useInventoryVms } from 'src/modules/Providers/views';
import {
  NetworkMapModelGroupVersionKind,
  ProviderModelGroupVersionKind,
  StorageMapModelGroupVersionKind,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1Provider,
  V1beta1StorageMap,
} from '@kubev2v/types';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Modal, ModalVariant } from '@patternfly/react-core';

import './PlanVMsDeleteModal.style.css';
import './PlanVMsEditModal.style.css';

export interface PlanVMsEditModalProps {
  plan: V1beta1Plan;
}

export const PlanVMsEditModal: React.FC<PlanVMsEditModalProps> = ({ plan }) => {
  // const { t } = useForkliftTranslation();
  const { toggleModal } = useModal();
  const [activeNamespace] = useActiveNamespace();
  const { t } = useForkliftTranslation();

  const [provider, providerLoaded, providerLoadError] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    name: plan?.spec?.provider?.source?.name,
    namespace: plan?.spec?.provider?.source?.namespace,
  });
  const [vmData] = useInventoryVms({ provider }, providerLoaded, providerLoadError);
  const initialSelectedIds = plan.spec.vms.map((specVm) => specVm.id);
  const selectedVMs = vmData.filter((vm) => initialSelectedIds.includes(vm.vm.id));

  console.log('plan', plan);
  console.log('provider', provider);
  // console.log('vmData', vmData);

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

  const planNetworkMaps = networkMaps
    ? networkMaps.find((net) => net?.metadata?.name === plan?.spec?.map?.network?.name)
    : null;
  const planStorageMaps = storageMaps
    ? storageMaps.find((storage) => storage?.metadata?.name === plan.spec.map?.storage?.name)
    : null;

  const finishedLoading =
    providerLoaded && networkMapsLoaded && storageMapsLoaded && vmData.length > 0;
  const hasErrors = providerLoadError || networkMapsError || storageMapsError;
  console.log(`hasErrors: ${hasErrors}`);

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
      {finishedLoading ? (
        <PlanEditPage
          plan={plan}
          namespace={activeNamespace}
          sourceProvider={provider}
          editAction="VMS"
          onClose={toggleModal}
          selectedVMs={selectedVMs}
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
