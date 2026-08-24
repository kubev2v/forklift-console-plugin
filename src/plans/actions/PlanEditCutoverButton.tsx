import { type FC, useRef } from 'react';
import { DateTime } from 'luxon';
import PlanCutoverMigrationModal from 'src/plans/actions/components/CutoverModal/PlanCutoverMigrationModal';
import { usePlanMigration } from 'src/plans/hooks/usePlanMigration';

import type { V1beta1Plan } from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { Button, type ButtonVariant, Tooltip } from '@patternfly/react-core';
import { CalendarAltIcon } from '@patternfly/react-icons';
import { getPlanIsWarm } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import {
  getPlanStatus,
  isPlanArchived,
  isPlanExecuting,
} from '../details/components/PlanStatus/utils/planStatusResolver';
import { PlanStatuses } from '../details/components/PlanStatus/utils/types';

import type { PlanModalProps } from './components/types';

type PlanEditCutoverButtonProps = {
  plan: V1beta1Plan;
  variant: ButtonVariant;
};

const PlanEditCutoverButton: FC<PlanEditCutoverButtonProps> = ({ plan, variant }) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();
  const cutoverButtonRef = useRef<HTMLButtonElement>(null);
  const [activeMigration] = usePlanMigration(plan);

  if (
    !getPlanIsWarm(plan) ||
    !isPlanExecuting(plan) ||
    isPlanArchived(plan) ||
    getPlanStatus(plan) === PlanStatuses.Pending
  ) {
    return null;
  }

  const cutoverDateTime = activeMigration?.spec?.cutover
    ? DateTime.fromISO(activeMigration.spec.cutover).toLocaleString(DateTime.DATETIME_FULL)
    : '';

  return (
    <>
      <Button
        icon={<CalendarAltIcon />}
        iconPosition="left"
        isInline
        onClick={() => {
          launchOverlay<PlanModalProps>(PlanCutoverMigrationModal, { plan });
        }}
        ref={cutoverButtonRef}
        variant={variant}
      >
        {cutoverDateTime ? t('Edit cutover') : t('Schedule cutover')}
      </Button>
      {cutoverDateTime ? <Tooltip content={cutoverDateTime} triggerRef={cutoverButtonRef} /> : null}
    </>
  );
};

export default PlanEditCutoverButton;
