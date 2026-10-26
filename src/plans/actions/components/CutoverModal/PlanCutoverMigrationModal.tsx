import { useCallback } from 'react';
import CutoverMigrationModal from 'src/plans/components/CutoverModal/CutoverMigrationModal';
import { CUTOVER_MODE_SCHEDULED } from 'src/plans/components/CutoverModal/hooks/useCutoverFormState';
import { patchMigrationCutover } from 'src/plans/components/CutoverModal/utils/utils';
import { usePlanMigration } from 'src/plans/hooks/usePlanMigration';
import { ForkliftTrans } from 'src/utils/i18n';

import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Stack, StackItem } from '@patternfly/react-core';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { getName } from '@utils/crds/common/selectors';

import type { PlanModalProps } from '../types';

const PlanCutoverMigrationModal: OverlayComponent<PlanModalProps> = ({ closeOverlay, plan }) => {
  const { trackEvent } = useForkliftAnalytics();
  const [activeMigration] = usePlanMigration(plan);

  const onSetCutover = useCallback(
    async (cutover: string) => {
      if (activeMigration) {
        await patchMigrationCutover(activeMigration, cutover, trackEvent);
      }
    },
    [activeMigration, trackEvent],
  );

  const onRemoveCutover = useCallback(async () => {
    if (activeMigration) {
      await patchMigrationCutover(activeMigration, undefined, trackEvent);
    }
  }, [activeMigration, trackEvent]);

  return (
    <CutoverMigrationModal
      closeOverlay={closeOverlay}
      description={
        <ForkliftTrans>
          <Stack hasGutter>
            <StackItem>
              Schedule the cutover for migration{' '}
              <strong className="co-break-word">{getName(plan)}</strong>?
            </StackItem>
            <StackItem>
              VMs included in the migration plan will inherit this cutover time by default, unless a
              cutover override has been set for them
            </StackItem>
          </Stack>
        </ForkliftTrans>
      }
      existingCutover={activeMigration?.spec?.cutover}
      onRemoveCutover={onRemoveCutover}
      onSetCutover={onSetCutover}
      removeActionMode={CUTOVER_MODE_SCHEDULED}
    />
  );
};

export default PlanCutoverMigrationModal;
