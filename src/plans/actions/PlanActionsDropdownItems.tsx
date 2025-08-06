import type { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { DropdownItem, DropdownList } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';
import { getPlanIsWarm } from '@utils/crds/plans/selectors';
import { getPlanURL } from '@utils/crds/plans/utils';

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
import PlanStartMigrationModal from './components/StartPlanModal/PlanStartMigrationModal';
import { getDuplicateDescription, getEditDescription, startDescription } from './utils/utils';

type PlanActionsDropdownItemsProps = {
  plan: V1beta1Plan;
};

const PlanActionsDropdownItems: FC<PlanActionsDropdownItemsProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();
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

  const [lastMigration] = usePlanMigration(plan);
  const hasCutover = canScheduleCutover && Boolean(lastMigration?.spec?.cutover);

  const onClickPlanStart = () => {
    showModal(<PlanStartMigrationModal plan={plan} title={buttonStartLabel} />);
  };

  const onClickPlanCutover = () => {
    showModal(<PlanCutoverMigrationModal plan={plan} />);
  };

  const onClickDuplicate = () => {
    showModal(<DuplicateModal plan={plan} />);
  };

  const onClickArchive = () => {
    showModal(<ArchiveModal plan={plan} />);
  };

  const onClickPlanDelete = () => {
    showModal(<PlanDeleteModal plan={plan} />);
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
        isDisabled={!canStart && !canReStart}
        onClick={onClickPlanStart}
        description={startDescription[planStatus]}
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
