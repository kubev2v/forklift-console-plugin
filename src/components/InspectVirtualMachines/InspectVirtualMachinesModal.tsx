import { useCallback, useMemo, useState } from 'react';
import TechPreviewLabel from 'src/components/PreviewLabels/TechPreviewLabel';
import { useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import type { V1beta1Plan, V1beta1Provider } from '@forklift-ui/types';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Alert, AlertVariant, ModalVariant } from '@patternfly/react-core';
import { getNamespace, getUID, getVddkInitImage } from '@utils/crds/common/selectors';
import { CONVERSION_LABELS, CONVERSION_TYPE } from '@utils/crds/conversion/constants';
import { isEmpty } from '@utils/helpers';
import { useInventoryVms } from '@utils/hooks/useInventoryVms';
import { useVmInspectionStatus } from '@utils/hooks/useVmInspectionStatus';
import { useWatchConversions } from '@utils/hooks/useWatchConversions';

import { useCreateDeepInspections } from './hooks/useCreateDeepInspections';
import { normalizeInventoryVms, normalizePlanVms } from './utils/normalizeVmsForInspection';
import InspectionVmTable from './InspectionVmTable';

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

  const namespace = plan ? getNamespace(plan) : getNamespace(provider);
  const isVddkConfigured = !isEmpty(getVddkInitImage(provider));

  const matchLabels: Record<string, string> = {
    [CONVERSION_LABELS.CONVERSION_TYPE]: CONVERSION_TYPE.DEEP_INSPECTION,
  };

  if (plan) {
    matchLabels[CONVERSION_LABELS.PLAN] = getUID(plan) ?? '';
  } else {
    matchLabels[CONVERSION_LABELS.PROVIDER] = getUID(provider) ?? '';
  }

  const [conversions, conversionsLoaded, conversionsError] = useWatchConversions({
    namespace: namespace ?? '',
    selector: { matchLabels },
  });

  const getVmInspectionStatus = useVmInspectionStatus(conversions);
  const createInspections = useCreateDeepInspections({ plan, provider });

  const [inventoryVmData] = useInventoryVms({ provider: plan ? undefined : provider });

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

  const handleConfirm = useCallback(async () => {
    const selectedSet = new Set(selectedIds);
    const vmsToInspect = vmRows
      .filter((vm) => selectedSet.has(vm.id) && !vm.isActive)
      .map((vm) => ({ id: vm.id, name: vm.name }));

    const result = await createInspections(vmsToInspect);
    if (!isEmpty(result.failed)) {
      throw new Error(
        t('Failed to create inspection for {{count}} VM', { count: result.failed.length }),
      );
    }

    setSelectedIds([]);
  }, [vmRows, selectedIds, createInspections, t]);

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
      <InspectionVmTable vmRows={vmRows} selectedIds={selectedIds} onSelect={setSelectedIds} />
    </ModalForm>
  );
};

export default InspectVirtualMachinesModal;
