import type { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, type V1beta1Plan } from '@forklift-ui/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItem, DropdownList } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';
import { getPlanIsWarm } from '@utils/crds/plans/selectors';
import { getPlanURL } from '@utils/crds/plans/utils';
import { isEmpty } from '@utils/helpers';

import { PlanStatuses } from '../details/components/PlanStatus/utils/types';
import {
  canPlanReStart,
  canPlanStart,
  getPlanStatus,
  isPlanArchived,
  isPlanExecuting,
} from '../details/components/PlanStatus/utils/utils';
import { usePlanMigration } from '../hooks/usePlanMigration';

import ArchiveModal from './components/ArchiveModal';
import PlanCutoverMigrationModal from './components/CutoverModal/PlanCutoverMigrationModal';
import DuplicateModal from './components/DuplicateModal/DuplicateModal';
import PlanDeleteModal from './components/PlanDeleteModal';
import PlanStartMigrationModal, {
  type PlanStartMigrationModalProps,
} from './components/StartPlanModal/PlanStartMigrationModal';
import type { PlanModalProps } from './components/types';
import { getDuplicateDescription, getEditDescription, startDescription } from './utils/utils';

type PlanActionsDropdownItemsProps = {
  plan: V1beta1Plan;
};

const PlanActionsDropdownItems: FC<PlanActionsDropdownItemsProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();
  const navigate = useNavigate();

  const { canDelete } = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace: getNamespace(plan),
  });

  const planURL = getPlanURL(plan);
  const planStatus = getPlanStatus(plan);

  const canStart = canPlanStart(plan);
  const canReStart = canPlanReStart(plan);
  const isWarmAndExecuting = getPlanIsWarm(plan) && isPlanExecuting(plan);
  const isArchived = isPlanArchived(plan);
  const buttonStartLabel = canReStart ? t('Restart') : t('Start');
  const canScheduleCutover = isWarmAndExecuting && !isArchived;

  const [activeMigration] = usePlanMigration(plan);
  const hasCutover = canScheduleCutover && Boolean(activeMigration?.spec?.cutover);

  const onClickPlanStart = () => {
    launcher<PlanStartMigrationModalProps>(PlanStartMigrationModal, {
      plan,
      title: buttonStartLabel,
    });
  };

  const onClickPlanCutover = () => {
    launcher<PlanModalProps>(PlanCutoverMigrationModal, { plan });
  };

  const onClickDuplicate = () => {
    launcher<PlanModalProps>(DuplicateModal, { plan });
  };

  const onClickArchive = () => {
    launcher<PlanModalProps>(ArchiveModal, { plan });
  };

  const onClickPlanDelete = () => {
    launcher<PlanModalProps>(PlanDeleteModal, { plan });
  };

  return (
    <DropdownList>
      <DropdownItem
        value={0}
        key="edit"
        onClick={() => {
          navigate(planURL);
        }}
        description={getEditDescription(planStatus)}
        isDisabled={[PlanStatuses.Executing, PlanStatuses.Paused, PlanStatuses.Archived].some(
          (status) => status === planStatus,
        )}
      >
        {t('Edit')}
      </DropdownItem>
      <DropdownItem
        value={1}
        key="start"
        isDisabled={!canStart && !canReStart && !isEmpty(activeMigration)}
        onClick={isEmpty(activeMigration) ? onClickPlanStart : undefined}
        description={startDescription[planStatus]}
        data-testid="plan-actions-start-menuitem"
      >
        {buttonStartLabel}
      </DropdownItem>
      <DropdownItem
        value={2}
        key="cutover"
        isDisabled={!canScheduleCutover}
        onClick={onClickPlanCutover}
      >
        {hasCutover ? t('Edit cutover') : t('Schedule cutover')}
      </DropdownItem>
      <DropdownItem
        value={3}
        key="duplicate"
        isDisabled={planStatus === PlanStatuses.CannotStart}
        onClick={onClickDuplicate}
        description={getDuplicateDescription(planStatus)}
      >
        {t('Duplicate')}
      </DropdownItem>
      <DropdownItem
        value={4}
        key="archive"
        isDisabled={!canDelete || planStatus === PlanStatuses.Archived}
        onClick={onClickArchive}
      >
        {t('Archive')}
      </DropdownItem>
      <DropdownItem value={5} key="delete" isDisabled={!canDelete} onClick={onClickPlanDelete}>
        {t('Delete')}
      </DropdownItem>
    </DropdownList>
  );
};

export default PlanActionsDropdownItems;
