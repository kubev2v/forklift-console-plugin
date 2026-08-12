import { type FC, useCallback, useMemo } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Plan } from '@forklift-ui/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import BulkArchivePlansModal, { type BulkArchivePlansModalProps } from './BulkArchivePlansModal';
import { getPlansEligibleForArchive, getSelectedPlans } from './utils';

type BulkArchivePlansDropdownItemProps = {
  canPatch: boolean;
  plans: V1beta1Plan[];
  selectedIds: string[];
};

const BulkArchivePlansDropdownItem: FC<BulkArchivePlansDropdownItemProps> = ({
  canPatch,
  plans,
  selectedIds,
}) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  const selectedPlans = useMemo(() => getSelectedPlans(plans, selectedIds), [plans, selectedIds]);
  const eligiblePlans = useMemo(() => getPlansEligibleForArchive(selectedPlans), [selectedPlans]);
  const skippedArchivedCount = selectedPlans.length - eligiblePlans.length;

  const disabledReason = useMemo(() => {
    if (!canPatch) {
      return t('You do not have permission to archive migration plans.');
    }
    if (isEmpty(selectedIds)) {
      return t('Select at least one migration plan.');
    }
    if (isEmpty(eligiblePlans)) {
      return t('All selected plans are already archived.');
    }
    return undefined;
  }, [canPatch, eligiblePlans, selectedIds, t]);

  const onClick = useCallback(() => {
    if (disabledReason) {
      return;
    }

    launcher<BulkArchivePlansModalProps>(BulkArchivePlansModal, {
      plans: eligiblePlans,
      skippedArchivedCount,
    });
  }, [disabledReason, eligiblePlans, launcher, skippedArchivedCount]);

  return (
    <DropdownItem
      data-testid="bulk-archive-plans-menuitem"
      description={disabledReason}
      isDisabled={Boolean(disabledReason)}
      key="bulk-archive"
      onClick={onClick}
    >
      {t('Archive')}
    </DropdownItem>
  );
};

export default BulkArchivePlansDropdownItem;
