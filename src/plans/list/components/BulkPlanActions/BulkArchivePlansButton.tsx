import { type FC, useCallback, useMemo } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Plan } from '@forklift-ui/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, ToolbarItem, Tooltip } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import BulkArchivePlansModal, { type BulkArchivePlansModalProps } from './BulkArchivePlansModal';
import { getPlansEligibleForArchive, getSelectedPlans } from './utils';

type BulkArchivePlansButtonProps = {
  plans: V1beta1Plan[];
  selectedIds: string[];
  canDelete: boolean;
  onComplete?: () => void;
};

const BulkArchivePlansButton: FC<BulkArchivePlansButtonProps> = ({
  canDelete,
  onComplete,
  plans,
  selectedIds,
}) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  const selectedPlans = useMemo(() => getSelectedPlans(plans, selectedIds), [plans, selectedIds]);
  const eligiblePlans = useMemo(() => getPlansEligibleForArchive(selectedPlans), [selectedPlans]);

  const disabledReason = useMemo(() => {
    if (!canDelete) {
      return t('You do not have permission to archive migration plans.');
    }
    if (isEmpty(selectedIds)) {
      return t('Select at least one migration plan.');
    }
    if (isEmpty(eligiblePlans)) {
      return t('All selected plans are already archived.');
    }
    return null;
  }, [canDelete, eligiblePlans, selectedIds, t]);

  const onClick = useCallback(() => {
    if (disabledReason) {
      return;
    }

    launcher<BulkArchivePlansModalProps>(BulkArchivePlansModal, {
      onComplete,
      plans: selectedPlans,
    });
  }, [disabledReason, launcher, onComplete, selectedPlans]);

  const button = (
    <Button
      variant={ButtonVariant.secondary}
      onClick={onClick}
      isAriaDisabled={Boolean(disabledReason)}
      data-testid="bulk-archive-plans-button"
    >
      {t('Archive')}
    </Button>
  );

  return (
    <ToolbarItem>
      {disabledReason ? <Tooltip content={disabledReason}>{button}</Tooltip> : button}
    </ToolbarItem>
  );
};

export default BulkArchivePlansButton;
