import { useCallback } from 'react';
import CutoverMigrationModal from 'src/plans/components/CutoverModal/CutoverMigrationModal';
import { CUTOVER_MODE_INHERIT } from 'src/plans/components/CutoverModal/hooks/useCutoverFormState';
import {
  getVmCutover,
  patchMigrationVmCutover,
} from 'src/plans/components/CutoverModal/utils/utils';

import type { V1beta1Migration } from '@forklift-ui/types';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Stack, StackItem } from '@patternfly/react-core';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { ForkliftTrans } from '@utils/i18n';

export type VmModalProps = {
  migration: V1beta1Migration;
  vmId: string;
  vmName: string;
};

const VmCutoverMigrationModal: OverlayComponent<VmModalProps> = ({
  closeOverlay,
  migration,
  vmId,
  vmName,
}) => {
  const { trackEvent } = useForkliftAnalytics();
  const cutover = getVmCutover(migration, vmId);

  const onSetCutover = useCallback(
    async (vmCutover: string) => {
      await patchMigrationVmCutover(migration, vmId, vmCutover, trackEvent);
    },
    [trackEvent, migration, vmId],
  );

  const onRemoveCutover = useCallback(async () => {
    if (cutover) {
      await patchMigrationVmCutover(migration, vmId, undefined, trackEvent);
    }
  }, [cutover, migration, trackEvent, vmId]);

  return (
    <CutoverMigrationModal
      closeOverlay={closeOverlay}
      description={
        <ForkliftTrans values={{ vmName }}>
          <Stack hasGutter>
            <StackItem>
              Schedule the cutover for VM <strong className="co-break-word">{{ vmName }}</strong>?
            </StackItem>
            <StackItem>
              By default this virtual machine shuts down at the plans cutover time. Setting a
              cutover here overrides that for this VM only.
            </StackItem>
          </Stack>
        </ForkliftTrans>
      }
      existingCutover={cutover}
      inheritOption={true}
      onRemoveCutover={onRemoveCutover}
      onSetCutover={onSetCutover}
      removeActionMode={CUTOVER_MODE_INHERIT}
    />
  );
};
export default VmCutoverMigrationModal;
