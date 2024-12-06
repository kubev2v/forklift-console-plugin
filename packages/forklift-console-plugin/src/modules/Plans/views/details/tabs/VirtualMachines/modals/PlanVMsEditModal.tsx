// import React, { useReducer, useState } from 'react';
// import { PlanEditPage } from 'src/modules/Plans/views/create/PlanEditPage';
// import {
//   planCreatePageInitialState,
//   planCreatePageReducer,
// } from 'src/modules/Plans/views/create/states';
// import { useModal } from 'src/modules/Providers/modals';
// import { useInventoryVms } from 'src/modules/Providers/views';
// import { setPlanTargetProvider } from 'src/modules/Providers/views/migrate/reducer/actions';
// import { createInitialState } from 'src/modules/Providers/views/migrate/reducer/createInitialState';
// import { reducer } from 'src/modules/Providers/views/migrate/reducer/reducer';
// import { useImmerReducer } from 'use-immer';

// // import { useInventoryVms } from 'src/modules/Providers/views';
// import { V1beta1Plan /*V1beta1Provider*/ } from '@kubev2v/types';
// import { ProviderModelGroupVersionKind, V1beta1Provider } from '@kubev2v/types';
// import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
// import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
// import { Modal, ModalVariant } from '@patternfly/react-core';

import React from 'react';
import { PlanEditPage } from 'src/modules/Plans/views/create/PlanEditPage';
import { useModal } from 'src/modules/Providers/modals';
import { useInventoryVms } from 'src/modules/Providers/views';

// import { useInventoryVms } from 'src/modules/Providers/views';
import { ProviderModelGroupVersionKind, V1beta1Plan, V1beta1Provider } from '@kubev2v/types';
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
  // const [done, setDone] = useState(false);
  // const [done2, setDone2] = useState(false);

  // const [provider, providerLoaded, providerLoadError] = useK8sWatchResource<V1beta1Provider>({
  //   groupVersionKind: ProviderModelGroupVersionKind,
  //   namespaced: true,
  //   name: plan?.spec?.provider?.source?.name,
  //   namespace: plan?.spec?.provider?.source?.namespace,
  // });

  // const [vmData, vmDataLoading] = useInventoryVms({ provider }, providerLoaded, providerLoadError);
  // const initialSelectedIds = plan.spec.vms.map((specVm) => specVm.id);
  // const selectedVMs = vmData.filter((vm) => initialSelectedIds.includes(vm.vm.id));
  // const { setData } = useCreateVmMigrationData();
  // debugger;
  // useEffect(() => {
  //   const selectedVMs = vmData.filter((vm) => vmIds.includes(vm.vm.id));
  //   if (!vmDataLoading && vmData.length > 0 && !done) {
  //     setDone(true);
  //     filterDispatch({ type: 'UPDATE_SELECTED_VMS', payload: selectedVMs });
  //   }
  // }, [vmData, providerLoaded, vmDataLoading, done]);

  // useEffect(() => {
  //   if (providerLoaded && !done2) {
  //     setDone2(true);
  //     filterDispatch({ type: 'SELECT_PROVIDER', payload: sourceProvider?.uid });
  //   }
  // }, [providerLoaded]);
  // useEffect(() => {
  //   setTimeout(() => {
  //     filterDispatch({ type: 'SELECT_PROVIDER', payload: sourceProvider?.uid });
  //   }, 1000);
  // }, []);

  // const sourceProvider = plan?.spec?.provider.source;
  // // const asd = provider;

  // const [filterState, filterDispatch] = useReducer(planCreatePageReducer, {
  //   ...planCreatePageInitialState,
  //   // selectedProviderUID: sourceProvider?.uid,
  //   // selectedVMs,
  // });
  // debugger;
  // const [state, dispatch] = useImmerReducer(
  //   reducer,
  //   {
  //     namespace: provider?.metadata?.namespace,
  //     sourceProvider: provider,
  //     selectedVms: [],
  //     plan,
  //   },
  //   createInitialState,
  // );

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

  return providerLoaded && vmData.length > 0 ? (
    <Modal
      position="top"
      showClose={false}
      variant={ModalVariant.large}
      isOpen={true}
      hasNoBodyWrapper
      className="forklift-edit-modal"
    >
      <PlanEditPage
        plan={plan}
        namespace={activeNamespace}
        sourceProvider={provider}
        // vms={vmData}
        editAction="VMS"
        onClose={toggleModal}
        // onMount={() => {
        //   filterDispatch({ type: 'SELECT_PROVIDER', payload: sourceProvider?.uid });
        //   // filterDispatch({ type: 'UPDATE_SELECTED_VMS', payload: selectedVMs });
        //   dispatch(setPlanTargetProvider(plan.metadata.name));
        // }}
        // initialSelectedIds={initialSelectedIds}
        selectedVMs={selectedVMs}
      />
    </Modal>
  ) : (
    <div>Loading</div>
  );
};
