import React, { FC, useMemo } from 'react';
import { PlanEditAction } from 'src/modules/Plans/utils/types/PlanEditAction';
import { PlanEditPage } from 'src/modules/Plans/views/edit/PlanEditPage';
import { useModal } from 'src/modules/Providers/modals';
import { useInventoryVms, VmData } from 'src/modules/Providers/views';
import { isEmpty } from 'src/utils';
import { useNetworkMaps, useProviders, useStorageMaps } from 'src/utils/fetch';
import { useForkliftTranslation } from 'src/utils/i18n';

import { V1beta1Plan, V1beta1PlanSpecVms } from '@kubev2v/types';
import { Modal, ModalVariant } from '@patternfly/react-core';

import './PlanVMsDeleteModal.style.css';
import './PlanVMsEditModal.style.css';

interface PlanVMsEditModalProps {
  plan: V1beta1Plan;
  editAction: PlanEditAction;
}

export const PlanVMsEditModal: FC<PlanVMsEditModalProps> = ({ plan, editAction }) => {
  const { toggleModal } = useModal();
  const { t } = useForkliftTranslation();
  const projectName = plan?.metadata?.namespace;

  // Retrieve all k8s Providers
  const [providers, providersLoaded, providersLoadError] = useProviders({
    namespace: projectName,
  });

  const sourceProvider = providers
    ? providers.find((p) => p?.metadata?.name === plan?.spec?.provider?.source?.name)
    : null;
  const targetProvider = providers
    ? providers.find((p) => p?.metadata?.name === plan?.spec?.provider?.destination?.name)
    : null;

  // Retrieve all k8s Network Mappings
  const [networkMaps, networkMapsLoaded, networkMapsError] = useNetworkMaps({
    namespace: projectName,
  });

  // Retrieve all k8s Storage Mappings
  const [storageMaps, storageMapsLoaded, storageMapsError] = useStorageMaps({
    namespace: projectName,
  });

  const [vmData] = useInventoryVms(
    { provider: sourceProvider },
    providersLoaded,
    providersLoadError,
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

  const planNetworkMaps = useMemo(() => {
    return networkMaps
      ? networkMaps.find((net) => net?.metadata?.name === plan?.spec?.map?.network?.name)
      : null;
  }, [networkMaps, plan]);
  const planStorageMaps = useMemo(() => {
    return storageMaps
      ? storageMaps.find((storage) => storage?.metadata?.name === plan.spec.map?.storage?.name)
      : null;
  }, [storageMaps, plan]);

  const finishedLoading =
    providersLoaded && networkMapsLoaded && storageMapsLoaded && !isEmpty(vmData.length);
  const hasErrors = providersLoadError || networkMapsError || storageMapsError;

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
