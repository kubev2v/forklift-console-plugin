import { useCallback, useMemo, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Plan, V1beta1Provider } from '@forklift-ui/types';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { getVddkInitImage } from '@utils/crds/common/selectors';
import { CONVERSION_LABELS, CONVERSION_TYPE } from '@utils/crds/conversion/constants';
import { isConversionActive } from '@utils/crds/conversion/selectors';
import { isEmpty } from '@utils/helpers';
import { useVmInspectionStatus } from '@utils/hooks/useVmInspectionStatus';
import { useWatchConversions } from '@utils/hooks/useWatchConversions';

import { useCreateDeepInspections } from './hooks/useCreateDeepInspections';
import InspectionVmTable from './InspectionVmTable';

export type InspectVirtualMachinesModalProps = {
  plan: V1beta1Plan;
  provider: V1beta1Provider;
};

type VmRow = {
  id: string;
  isActive: boolean;
  name: string;
};

const InspectVirtualMachinesModal: ModalComponent<InspectVirtualMachinesModalProps> = ({
  closeModal,
  plan,
  provider,
}) => {
  const { t } = useForkliftTranslation();
  const [selectedVmIds, setSelectedVmIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planNamespace = plan?.metadata?.namespace ?? '';
  const planUid = plan?.metadata?.uid ?? '';
  const isVddkConfigured = !isEmpty(getVddkInitImage(provider));

  const [conversions, conversionsLoaded, conversionsError] = useWatchConversions({
    namespace: planNamespace,
    selector: {
      matchLabels: {
        [CONVERSION_LABELS.CONVERSION_TYPE]: CONVERSION_TYPE.DEEP_INSPECTION,
        [CONVERSION_LABELS.PLAN]: planUid,
      },
    },
  });

  const getVmInspectionStatus = useVmInspectionStatus(conversions);
  const createInspections = useCreateDeepInspections({ plan, provider });

  const vmRows: VmRow[] = useMemo(
    () =>
      (plan?.spec?.vms ?? []).map((specVm) => {
        const vmId = specVm.id ?? '';
        const status = getVmInspectionStatus(vmId);
        const hasActiveInspection = status?.conversion
          ? isConversionActive(status.conversion)
          : false;

        return { id: vmId, isActive: hasActiveInspection, name: specVm.name ?? vmId };
      }),
    [plan?.spec?.vms, getVmInspectionStatus],
  );

  const selectableVms = vmRows.filter((vm) => !vm.isActive);
  const selectedCount = selectedVmIds.size;

  const toggleVmSelection = (vmId: string): void => {
    setSelectedVmIds((prev) => {
      const next = new Set(prev);
      if (next.has(vmId)) next.delete(vmId);
      else next.add(vmId);
      return next;
    });
  };

  const toggleSelectAll = (): void => {
    setSelectedVmIds(
      selectedCount === selectableVms.length
        ? new Set()
        : new Set(selectableVms.map((vm) => vm.id)),
    );
  };

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    const vmsToInspect = vmRows
      .filter((vm) => selectedVmIds.has(vm.id) && !vm.isActive)
      .map((vm) => ({ id: vm.id, name: vm.name }));

    try {
      const result = await createInspections(vmsToInspect);
      if (isEmpty(result.failed)) {
        setSelectedVmIds(new Set());
        closeModal();
      } else {
        setError(
          t('Failed to create inspection for {{count}} VM', {
            count: result.failed.length,
          }),
        );
      }
    } catch (err) {
      setError((err as Error)?.message ?? String(err));
    } finally {
      setIsSubmitting(false);
    }
  }, [vmRows, selectedVmIds, createInspections, closeModal, t]);

  const isSubmitDisabled =
    selectedCount === 0 ||
    !isVddkConfigured ||
    isSubmitting ||
    !conversionsLoaded ||
    Boolean(conversionsError);

  const confirmLabel =
    selectedCount > 0 ? t('Inspect {{count}} VM', { count: selectedCount }) : t('Inspect VMs');

  return (
    <Modal
      variant={ModalVariant.large}
      isOpen
      position="top"
      onClose={closeModal}
      data-testid="inspect-vms-modal"
    >
      <ModalHeader title={t('Inspect virtual machines')} />
      <ModalBody>
        <Stack hasGutter>
          {!isVddkConfigured && (
            <StackItem>
              <Alert
                variant={AlertVariant.warning}
                isInline
                title={t(
                  'VDDK image is required for deep inspection. Configure it in the provider settings.',
                )}
              />
            </StackItem>
          )}
          {error && (
            <StackItem>
              <Alert variant={AlertVariant.danger} isInline title={t('Error')}>
                {error}
              </Alert>
            </StackItem>
          )}
          <StackItem>
            <InspectionVmTable
              vmRows={vmRows}
              selectedVmIds={selectedVmIds}
              selectedCount={selectedCount}
              selectableCount={selectableVms.length}
              toggleVmSelection={toggleVmSelection}
              toggleSelectAll={toggleSelectAll}
              getVmInspectionStatus={getVmInspectionStatus}
            />
          </StackItem>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button
          key="confirm"
          variant={ButtonVariant.primary}
          onClick={handleSubmit}
          isLoading={isSubmitting}
          isDisabled={isSubmitDisabled}
          data-testid="inspect-vms-confirm-button"
        >
          {confirmLabel}
        </Button>
        <Button
          key="cancel"
          variant={ButtonVariant.secondary}
          onClick={closeModal}
          data-testid="inspect-vms-cancel-button"
        >
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default InspectVirtualMachinesModal;
