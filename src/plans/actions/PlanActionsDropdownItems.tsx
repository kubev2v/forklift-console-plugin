import { type FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { ArchiveModal } from 'src/modules/Plans/modals/ArchiveModal';
import { DuplicateModal } from 'src/modules/Plans/modals/DuplicateModal';
import { PlanCutoverMigrationModal } from 'src/modules/Plans/modals/PlanCutoverMigrationModal';
import { PlanDeleteModal } from 'src/modules/Plans/modals/PlanDeleteModal';
import { PlanStartMigrationModal } from 'src/modules/Plans/modals/PlanStartMigrationModal';
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

  const [isStartItemEnabled, setIsStartItemEnabled] = useState(canStart);

  useEffect(() => {
    if (canStart) setIsStartItemEnabled(true);
  }, [canStart]);

  const onClickPlanStart = () => {
    showModal(
      <PlanStartMigrationModal
        resource={plan}
        model={PlanModel}
        title={buttonStartLabel}
        setButtonEnabledOnChange={setIsStartItemEnabled}
      />,
    );
  };

  const onClickPlanCutover = () => {
    showModal(<PlanCutoverMigrationModal resource={plan} />);
  };

  const onClickDuplicate = () => {
    showModal(<DuplicateModal resource={plan} model={PlanModel} />);
  };

  const onClickArchive = () => {
    showModal(<ArchiveModal resource={plan} model={PlanModel} />);
  };

  const onClickPlanDelete = () => {
    showModal(<PlanDeleteModal resource={plan} model={PlanModel} />);
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
        isDisabled={!canStart || !isStartItemEnabled}
        onClick={onClickPlanStart}
        description={startDescription[planStatus]}
      >
        {buttonStartLabel}
      </DropdownItem>
      <DropdownItem
        value={2}
        key="cutover"
        isDisabled={!isWarmAndExecuting || isArchived}
        onClick={onClickPlanCutover}
      >
        {t('Cutover')}
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
