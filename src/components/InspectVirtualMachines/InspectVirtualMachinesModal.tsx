import { useCallback, useMemo, useState } from 'react';
import TechPreviewLabel from 'src/components/PreviewLabels/TechPreviewLabel';
import { useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import type { V1beta1Plan, V1beta1Provider } from '@forklift-ui/types';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Alert, AlertVariant, ModalVariant } from '@patternfly/react-core';
import { getNamespace, getUID, getVddkInitImage } from '@utils/crds/common/selectors';
import { CONVERSION_LABELS, CONVERSION_TYPE } from '@utils/crds/conversion/constants';
import { isEmpty } from '@utils/helpers';
import { useInventoryVms } from '@utils/hooks/useInventoryVms';
import { useVmInspectionStatus } from '@utils/hooks/useVmInspectionStatus';
import { useWatchConversions } from '@utils/hooks/useWatchConversions';

import { useCreateDeepInspections } from './hooks/useCreateDeepInspections';
import { normalizeVmsForInspection } from './utils/normalizeVmsForInspection';
import { resolveDiskEncryption } from './utils/resolveDiskEncryption';
import type { VmInspectionRef, VmOverrides } from './utils/types';
import InspectionVmTable from './InspectionVmTable';

import './InspectVirtualMachinesModal.scss';

export type InspectVirtualMachinesModalProps = {
  plan?: V1beta1Plan;
  provider: V1beta1Provider;
};

const InspectVirtualMachinesModal: OverlayComponent<InspectVirtualMachinesModalProps> = ({
  closeOverlay,
  plan,
  provider,
  ...rest
}) => {
  const { t } = useForkliftTranslation();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [vmOverrides, setVmOverrides] = useState<Record<string, VmOverrides>>({});

  const namespace = plan ? getNamespace(plan) : getNamespace(provider);
  const isVddkConfigured = !isEmpty(getVddkInitImage(provider));
  const isProviderFlow = !plan;

  const planUid = plan ? getUID(plan) : undefined;
  const providerUid = getUID(provider);

  const watchSelector = useMemo(() => {
    const labels: Record<string, string> = {
      [CONVERSION_LABELS.CONVERSION_TYPE]: CONVERSION_TYPE.DEEP_INSPECTION,
    };
    if (plan) {
      labels[CONVERSION_LABELS.PLAN] = planUid ?? '';
    } else {
      labels[CONVERSION_LABELS.PROVIDER] = providerUid ?? '';
    }
    return { matchLabels: labels };
  }, [plan, planUid, providerUid]);

  const [conversions, conversionsLoaded, conversionsError] = useWatchConversions({
    namespace: namespace ?? '',
    selector: watchSelector,
  });

  const getVmInspectionStatus = useVmInspectionStatus(conversions);
  const createInspections = useCreateDeepInspections({ plan, provider });

  const [inventoryVmData, inventoryLoading] = useInventoryVms({
    provider: plan ? undefined : provider,
  });

  const vmRows = useMemo(() => {
    const vms = plan ? (plan?.spec?.vms ?? []) : inventoryVmData.map((vmData) => vmData.vm);
    return normalizeVmsForInspection(vms, getVmInspectionStatus);
  }, [plan, inventoryVmData, getVmInspectionStatus]);

  const selectedCount = selectedIds.length;

  const handleVmOverrideChange = useCallback((vmId: string, overrides: VmOverrides): void => {
    setVmOverrides((prev) => ({ ...prev, [vmId]: overrides }));
  }, []);

  const handleConfirm = useCallback(async () => {
    const selectedSet = new Set(selectedIds);
    const selectedVms = vmRows.filter((vm) => selectedSet.has(vm.id) && !vm.isActive);
    const ns = namespace ?? '';

    const vmsToInspect: VmInspectionRef[] = await Promise.all(
      selectedVms.map(async (vm) => {
        const diskEncryption = isProviderFlow
          ? await resolveDiskEncryption(vmOverrides[vm.id], vm.name, ns)
          : undefined;
        return {
          diskEncryption,
          id: vm.id,
          name: vm.name,
          xfsCompatibility: vmOverrides[vm.id]?.xfsCompatibility,
        };
      }),
    );

    const result = await createInspections(vmsToInspect);
    if (!isEmpty(result.failed)) {
      throw new Error(
        t('Failed to create inspection for {{count}} VM', { count: result.failed.length }),
      );
    }

    setSelectedIds([]);
    setVmOverrides({});
  }, [vmRows, selectedIds, vmOverrides, namespace, createInspections, isProviderFlow, t]);

  const isSubmitDisabled =
    selectedCount === 0 || !isVddkConfigured || !conversionsLoaded || Boolean(conversionsError);

  const confirmLabel =
    selectedCount > 0 ? t('Inspect {{count}} VM', { count: selectedCount }) : t('Inspect VMs');

  return (
    <ModalForm
      className="forklift-inspect-vms-modal"
      closeModal={closeOverlay}
      confirmLabel={confirmLabel}
      isDisabled={isSubmitDisabled}
      label={<TechPreviewLabel />}
      onConfirm={handleConfirm}
      testId="inspect-vms-modal"
      title={t('Inspect virtual machines')}
      variant={ModalVariant.large}
      {...rest}
    >
      {!isVddkConfigured && (
        <Alert
          isInline
          title={t(
            'VDDK image is required for deep inspection. Configure it in the provider settings.',
          )}
          variant={AlertVariant.warning}
        />
      )}
      <InspectionVmTable
        isLoading={!plan && inventoryLoading}
        isProviderFlow={isProviderFlow}
        onSelect={setSelectedIds}
        onVmOverrideChange={handleVmOverrideChange}
        selectedIds={selectedIds}
        vmOverrides={vmOverrides}
        vmRows={vmRows}
      />
    </ModalForm>
  );
};

export default InspectVirtualMachinesModal;
