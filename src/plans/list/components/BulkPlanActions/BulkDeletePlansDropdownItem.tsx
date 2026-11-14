import { type FC, useCallback, useMemo } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { usePageSelectionConfig } from '@components/page/context/usePageSelectionConfig';
import type { V1beta1Plan } from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import BulkDeletePlansModal, { type BulkDeletePlansModalProps } from './BulkDeletePlansModal';
import { getPlansEligibleForDelete, getSelectedPlans, isPlanRunningOrPending } from './utils';

type BulkDeletePlansDropdownItemProps = {
  canDelete: boolean;
  plans: V1beta1Plan[];
  selectedIds: string[];
};

const BulkDeletePlansDropdownItem: FC<BulkDeletePlansDropdownItemProps> = ({
  canDelete,
  plans,
  selectedIds,
}) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();
  const { pruneSelectionRef } = usePageSelectionConfig<V1beta1Plan>();

  const selectedPlans = useMemo(() => getSelectedPlans(plans, selectedIds), [plans, selectedIds]);
  const eligiblePlans = useMemo(() => getPlansEligibleForDelete(selectedPlans), [selectedPlans]);
  const hasRunningOrPending = useMemo(
    () => selectedPlans.some((plan) => isPlanRunningOrPending(plan)),
    [selectedPlans],
  );

  const disabledReason = useMemo(() => {
    if (!canDelete) {
      return t('You do not have permission to delete migration plans.');
    }
    if (isEmpty(selectedIds)) {
      return t('Select at least one migration plan.');
    }
    if (hasRunningOrPending) {
      return t('Running or pending plans cannot be deleted. Clear them from the selection.');
    }
    if (isEmpty(eligiblePlans)) {
      return t('No selected plans can be deleted.');
    }
    return undefined;
  }, [canDelete, eligiblePlans, hasRunningOrPending, selectedIds, t]);

  const onComplete = useCallback(
    (succeededPlanIds: string[]) => {
      pruneSelectionRef.current(succeededPlanIds);
    },
    [pruneSelectionRef],
  );

  const onClick = useCallback(() => {
    if (disabledReason) {
      return;
    }

    launchOverlay<BulkDeletePlansModalProps>(BulkDeletePlansModal, {
      onComplete,
      plans: eligiblePlans,
    });
  }, [disabledReason, eligiblePlans, launchOverlay, onComplete]);

  return (
    <DropdownItem
      data-testid="bulk-delete-plans-menuitem"
      description={disabledReason}
      isDisabled={Boolean(disabledReason)}
      key="bulk-delete"
      onClick={onClick}
    >
      {t('Delete')}
    </DropdownItem>
  );
};

export default BulkDeletePlansDropdownItem;
