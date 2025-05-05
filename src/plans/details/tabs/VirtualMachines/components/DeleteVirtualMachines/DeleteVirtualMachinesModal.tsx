import { type FC, useCallback } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { PlanModel } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { ButtonVariant } from '@patternfly/react-core';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';

import type { DeleteVirtualMachineProps } from './utils/types';

const PlanVMsDeleteModal: FC<DeleteVirtualMachineProps> = ({ plan, selectedIds }) => {
  const { t } = useForkliftTranslation();

  const handleSave = useCallback(async () => {
    const vms = getPlanVirtualMachines(plan);
    const op = vms ? REPLACE : ADD;
    const filteredVMs = (vms ?? []).filter((vm) => !selectedIds.includes(vm.id!)) || [];

    return k8sPatch({
      data: [{ op, path: '/spec/vms', value: filteredVMs }],
      model: PlanModel,
      path: '',
      resource: plan,
    });
  }, [plan, selectedIds]);

  return (
    <ModalForm
      confirmLabel={t('Delete')}
      confirmVariant={ButtonVariant.danger}
      onConfirm={handleSave}
      title={t('Delete virtual machines from migration plan?')}
    >
      {t('The virtual machines will be permanently deleted from your migration plan.')}
    </ModalForm>
  );
};

export default PlanVMsDeleteModal;
