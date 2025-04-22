import { type FC, useEffect, useState } from 'react';
import { DropdownItemLink } from 'src/components/actions/DropdownItemLink';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { DropdownItem, DropdownList } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';
import { getPlanIsWarm } from '@utils/crds/plans/selectors';
import { getPlanURL } from '@utils/crds/plans/utils';

import { ArchiveModal } from '../modals/ArchiveModal';
import { DuplicateModal } from '../modals/DuplicateModal';
import { PlanCutoverMigrationModal } from '../modals/PlanCutoverMigrationModal';
import { PlanDeleteModal } from '../modals/PlanDeleteModal';
import { PlanStartMigrationModal } from '../modals/PlanStartMigrationModal';
import {
  canPlanReStart,
  canPlanStart,
  getPlanPhase,
  isPlanArchived,
  isPlanExecuting,
} from '../utils/helpers/getPlanPhase';
import { PlanPhase } from '../utils/types/PlanPhase';

type PlanActionsDropdownItemsProps = {
  plan: V1beta1Plan;
};

const PlanActionsDropdownItems: FC<PlanActionsDropdownItemsProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const { canDelete } = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace: getNamespace(plan),
  });

  const planURL = getPlanURL(plan);

  const phase = getPlanPhase({ plan });

  const canStart = canPlanStart(plan);
  const canReStart = canPlanReStart(plan);
  const isWarmAndExecuting = getPlanIsWarm(plan) && isPlanExecuting(plan);
  const isArchived = isPlanArchived(plan);
  const buttonStartLabel = canReStart ? t('Restart migration') : t('Start migration');

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
      <DropdownItemLink value={0} itemKey="EditPlan" href={planURL} description={t('Edit Plan')} />
      <DropdownItem
        value={1}
        key="start"
        isDisabled={!canStart || !isStartItemEnabled}
        onClick={onClickPlanStart}
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
      <DropdownItem value={3} key="duplicate" isDisabled={!canDelete} onClick={onClickDuplicate}>
        {t('Duplicate Plan')}
      </DropdownItem>
      <DropdownItem
        value={4}
        key="archive"
        isDisabled={!canDelete || [PlanPhase.Archived, PlanPhase.Archiving].includes(phase)}
        onClick={onClickArchive}
      >
        {t('Archive Plan')}
      </DropdownItem>
      <DropdownItem value={5} key="delete" isDisabled={!canDelete} onClick={onClickPlanDelete}>
        {t('Delete Plan')}
      </DropdownItem>
    </DropdownList>
  );
};

export default PlanActionsDropdownItems;
