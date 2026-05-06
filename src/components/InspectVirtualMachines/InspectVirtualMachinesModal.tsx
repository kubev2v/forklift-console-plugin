import { useCallback, useMemo, useState } from 'react';
import TechPreviewLabel from 'src/components/PreviewLabels/TechPreviewLabel';
import { useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import type { V1beta1Plan, V1beta1Provider } from '@forklift-ui/types';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Alert, AlertVariant, ModalVariant } from '@patternfly/react-core';
import { getNamespace, getUID, getVddkInitImage } from '@utils/crds/common/selectors';
import {
  CONVERSION_LABELS,
  CONVERSION_TYPE,
  DISK_ENCRYPTION_TYPE,
} from '@utils/crds/conversion/constants';
import { isEmpty } from '@utils/helpers';
import { useInventoryVms } from '@utils/hooks/useInventoryVms';
import { useVmInspectionStatus } from '@utils/hooks/useVmInspectionStatus';
import { useWatchConversions } from '@utils/hooks/useWatchConversions';

import type { VmInspectionRef } from './hooks/useCreateDeepInspections';
import { useCreateDeepInspections } from './hooks/useCreateDeepInspections';
import { createInspectionSecret } from './utils/createInspectionSecret';
import { normalizeInventoryVms, normalizePlanVms } from './utils/normalizeVmsForInspection';
import InspectionVmTable from './InspectionVmTable';
import type { VmOverrides } from './VmConfigForm';

import './InspectVirtualMachinesModal.scss';

export type InspectVirtualMachinesModalProps = {
  plan?: V1beta1Plan;
  provider: V1beta1Provider;
};

const InspectVirtualMachinesModal: ModalComponent<InspectVirtualMachinesModalProps> = ({
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
    if (plan) {
      return normalizePlanVms(plan?.spec?.vms ?? [], getVmInspectionStatus);
    }
    return normalizeInventoryVms(
      inventoryVmData.map((vmData) => vmData.vm),
      getVmInspectionStatus,
    );
  }, [plan, inventoryVmData, getVmInspectionStatus]);

  const selectedCount = selectedIds.length;

  const handleVmOverrideChange = useCallback((vmId: string, overrides: VmOverrides): void => {
    setVmOverrides((prev) => ({ ...prev, [vmId]: overrides }));
  }, []);

  const resolveDiskEncryption = useCallback(
    async (vmId: string, vmName: string): Promise<VmInspectionRef['diskEncryption']> => {
      const overrides = vmOverrides[vmId];
      if (!overrides) return undefined;

      if (overrides.nbdeClevis) {
        return { type: DISK_ENCRYPTION_TYPE.CLEVIS };
      }

      const nonEmptyPhrases = (overrides.passphrases ?? []).filter((phrase) => !isEmpty(phrase));
      if (!isEmpty(nonEmptyPhrases)) {
        const secret = await createInspectionSecret(nonEmptyPhrases, vmName, namespace ?? '');
        return {
          secret: { name: secret.metadata?.name, namespace: secret.metadata?.namespace },
          type: DISK_ENCRYPTION_TYPE.LUKS,
        };
      }

      return undefined;
    },
    [vmOverrides, namespace],
  );

  const handleConfirm = useCallback(async () => {
    const selectedSet = new Set(selectedIds);
    const selectedVms = vmRows.filter((vm) => selectedSet.has(vm.id) && !vm.isActive);

    const vmsToInspect: VmInspectionRef[] = await Promise.all(
      selectedVms.map(async (vm) => {
        const diskEncryption = isProviderFlow
          ? await resolveDiskEncryption(vm.id, vm.name)
          : undefined;
        return { diskEncryption, id: vm.id, name: vm.name };
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
  }, [vmRows, selectedIds, createInspections, isProviderFlow, resolveDiskEncryption, t]);

  const isSubmitDisabled =
    selectedCount === 0 || !isVddkConfigured || !conversionsLoaded || Boolean(conversionsError);

  const confirmLabel =
    selectedCount > 0 ? t('Inspect {{count}} VM', { count: selectedCount }) : t('Inspect VMs');

  return (
    <ModalForm
      title={t('Inspect virtual machines')}
      label={<TechPreviewLabel />}
      onConfirm={handleConfirm}
      confirmLabel={confirmLabel}
      isDisabled={isSubmitDisabled}
      variant={ModalVariant.large}
      className="forklift-inspect-vms-modal"
      testId="inspect-vms-modal"
      {...rest}
    >
      {!isVddkConfigured && (
        <Alert
          variant={AlertVariant.warning}
          isInline
          title={t(
            'VDDK image is required for deep inspection. Configure it in the provider settings.',
          )}
        />
      )}
      <InspectionVmTable
        vmRows={vmRows}
        selectedIds={selectedIds}
        onSelect={setSelectedIds}
        isLoading={!plan && inventoryLoading}
        isProviderFlow={isProviderFlow}
        vmOverrides={vmOverrides}
        onVmOverrideChange={handleVmOverrideChange}
      />
    </ModalForm>
  );
};

export default InspectVirtualMachinesModal;
