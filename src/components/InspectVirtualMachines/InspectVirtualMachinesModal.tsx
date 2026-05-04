import { useCallback, useMemo, useState } from 'react';
import TechPreviewLabel from 'src/components/PreviewLabels/TechPreviewLabel';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Plan, V1beta1Provider } from '@forklift-ui/types';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
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

import './InspectVirtualMachinesModal.scss';

export type InspectVirtualMachinesModalProps = {
  plan: V1beta1Plan;
  provider: V1beta1Provider;
};

const InspectVirtualMachinesModal: ModalComponent<InspectVirtualMachinesModalProps> = ({
  closeModal,
  plan,
  provider,
}) => {
  const { t } = useForkliftTranslation();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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

  const vmRows = useMemo(
    () =>
      (plan?.spec?.vms ?? []).map((specVm) => {
        const vmId = specVm.id ?? '';
        const status = getVmInspectionStatus(vmId);
        const hasActiveInspection = status?.conversion
          ? isConversionActive(status.conversion)
          : false;

        return {
          id: vmId,
          isActive: hasActiveInspection,
          name: specVm.name ?? vmId,
          phase: status?.phase,
          timestamp: status?.lastRun,
        };
      }),
    [plan?.spec?.vms, getVmInspectionStatus],
  );

  const selectedCount = selectedIds.length;

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    const selectedSet = new Set(selectedIds);
    const vmsToInspect = vmRows
      .filter((vm) => selectedSet.has(vm.id) && !vm.isActive)
      .map((vm) => ({ id: vm.id, name: vm.name }));

    try {
      const result = await createInspections(vmsToInspect);
      if (isEmpty(result.failed)) {
        setSelectedIds([]);
        closeModal();
      } else {
        setError(
          t('Failed to create inspection for {{count}} VM', { count: result.failed.length }),
        );
      }
    } catch (err) {
      setError((err as Error)?.message ?? String(err));
    } finally {
      setIsSubmitting(false);
    }
  }, [vmRows, selectedIds, createInspections, closeModal, t]);

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
      className="forklift-inspect-vms-modal"
      data-testid="inspect-vms-modal"
    >
      <ModalHeader
        title={
          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
            <FlexItem>{t('Inspect virtual machines')}</FlexItem>
            <FlexItem>
              <TechPreviewLabel />
            </FlexItem>
          </Flex>
        }
      />
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
              selectedIds={selectedIds}
              onSelect={setSelectedIds}
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
