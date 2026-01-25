import { type FC, useRef } from 'react';
import { DateTime } from 'luxon';
import PlanCutoverMigrationModal from 'src/plans/actions/components/CutoverModal/PlanCutoverMigrationModal';
import { usePlanMigration } from 'src/plans/hooks/usePlanMigration';

import type { V1beta1Plan } from '@forklift-ui/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Button, type ButtonVariant, Tooltip } from '@patternfly/react-core';
import { CalendarAltIcon } from '@patternfly/react-icons';
import { getPlanIsWarm } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import { isPlanArchived, isPlanExecuting } from '../details/components/PlanStatus/utils/utils';

import type { PlanModalProps } from './components/types';

type PlanEditCutoverButtonProps = {
  plan: V1beta1Plan;
  variant: ButtonVariant;
};

const PlanEditCutoverButton: FC<PlanEditCutoverButtonProps> = ({ plan, variant }) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();
  const cutoverButtonRef = useRef<HTMLButtonElement>(null);
  const [migration] = usePlanMigration(plan);

  if (!getPlanIsWarm(plan) || !isPlanExecuting(plan) || isPlanArchived(plan)) {
    return null;
  }

  const cutoverDateTime = migration?.spec?.cutover
    ? DateTime.fromISO(migration.spec.cutover).toLocaleString(DateTime.DATETIME_FULL)
    : '';

  return (
    <>
      <Button
        ref={cutoverButtonRef}
        isInline
        variant={variant}
        onClick={() => {
          launcher<PlanModalProps>(PlanCutoverMigrationModal, { plan });
        }}
        icon={<CalendarAltIcon />}
        iconPosition="left"
      >
        {cutoverDateTime ? t('Edit cutover') : t('Schedule cutover')}
      </Button>
      {cutoverDateTime ? <Tooltip content={cutoverDateTime} triggerRef={cutoverButtonRef} /> : null}
    </>
  );
};

export default PlanEditCutoverButton;
