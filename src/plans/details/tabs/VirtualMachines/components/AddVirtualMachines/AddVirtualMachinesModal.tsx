import { useCallback, useRef, useState } from 'react';
import usePlanSourceProvider from 'src/plans/details/hooks/usePlanSourceProvider';
import type { VmData } from 'src/providers/details/tabs/VirtualMachines/components/VMCellProps';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { PlanModel, type V1beta1PlanSpecVms } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { ModalVariant } from '@patternfly/react-core';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';

import AddVirtualMachinesTable from './components/AddVirtualMachinesTable';
import type { AddVirtualMachineProps } from './utils/types';

const AddVirtualMachinesModal: ModalComponent<AddVirtualMachineProps> = ({ plan, ...rest }) => {
  const { t } = useForkliftTranslation();
  const { sourceProvider } = usePlanSourceProvider(plan);
  const selectedVmsRef = useRef<VmData[]>([]);
  const [hasSelection, setHasSelection] = useState(false);

  const handleSelect = useCallback((vms: VmData[]): void => {
    selectedVmsRef.current = vms;
    setHasSelection(!isEmpty(vms));
  }, []);

  const handleSave = useCallback(async () => {
    const currentVms = getPlanVirtualMachines(plan);
    const op = currentVms ? REPLACE : ADD;

    const newVmEntries: V1beta1PlanSpecVms[] = selectedVmsRef.current.map((vmData) => ({
      id: vmData.vm.id,
      name: vmData.vm.name,
      ...(sourceProvider?.spec?.type === PROVIDER_TYPES.openshift && {
        namespace: vmData.namespace,
      }),
    }));

    const updatedVms = [...(currentVms ?? []), ...newVmEntries];

    return k8sPatch({
      data: [{ op, path: '/spec/vms', value: updatedVms }],
      model: PlanModel,
      path: '',
      resource: plan,
    });
  }, [plan, sourceProvider]);

  return (
    <ModalForm
      confirmLabel={t('Add virtual machines')}
      isDisabled={!hasSelection}
      onConfirm={handleSave}
      title={t('Add virtual machines to migration plan')}
      variant={ModalVariant.large}
      {...rest}
    >
      <AddVirtualMachinesTable onSelect={handleSelect} plan={plan} />
    </ModalForm>
  );
};

export default AddVirtualMachinesModal;
