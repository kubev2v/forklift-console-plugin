import { type FC, useCallback, useMemo } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Plan } from '@forklift-ui/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, ToolbarItem, Tooltip } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import BulkDeletePlansModal, { type BulkDeletePlansModalProps } from './BulkDeletePlansModal';
import { getSelectedPlans } from './utils';

type BulkDeletePlansButtonProps = {
  plans: V1beta1Plan[];
  selectedIds: string[];
  canDelete: boolean;
  onComplete?: () => void;
};

const BulkDeletePlansButton: FC<BulkDeletePlansButtonProps> = ({
  canDelete,
  onComplete,
  plans,
  selectedIds,
}) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  const selectedPlans = useMemo(() => getSelectedPlans(plans, selectedIds), [plans, selectedIds]);

  const disabledReason = useMemo(() => {
    if (!canDelete) {
      return t('You do not have permission to delete migration plans.');
    }
    if (isEmpty(selectedIds)) {
      return t('Select at least one migration plan.');
    }
    return null;
  }, [canDelete, selectedIds, t]);

  const onClick = useCallback(() => {
    if (disabledReason) {
      return;
    }

    launcher<BulkDeletePlansModalProps>(BulkDeletePlansModal, {
      onComplete,
      plans: selectedPlans,
    });
  }, [disabledReason, launcher, onComplete, selectedPlans]);

  const button = (
    <Button
      variant={ButtonVariant.secondary}
      onClick={onClick}
      isAriaDisabled={Boolean(disabledReason)}
      data-testid="bulk-delete-plans-button"
    >
      {t('Delete')}
    </Button>
  );

  return (
    <ToolbarItem>
      {disabledReason ? <Tooltip content={disabledReason}>{button}</Tooltip> : button}
    </ToolbarItem>
  );
};

export default BulkDeletePlansButton;
