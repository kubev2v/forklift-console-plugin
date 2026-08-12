import type { FC } from 'react';
import { useNavigate } from 'react-router';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, type V1beta1Plan } from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItem, DropdownList } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';
import { getPlanIsWarm } from '@utils/crds/plans/selectors';
import { getPlanURL } from '@utils/crds/plans/utils';
import { isEmpty } from '@utils/helpers';

import { PlanStatuses } from '../details/components/PlanStatus/utils/types';
import {
  canPlanReStart,
  canPlanResumeConversion,
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
import PlanResumeConversionModal, {
  type PlanResumeConversionModalProps,
} from './components/ResumeConversionModal/PlanResumeConversionModal';
import PlanStartMigrationModal, {
  type PlanStartMigrationModalProps,
} from './components/StartPlanModal/PlanStartMigrationModal';
import type { PlanModalProps } from './components/types';
import { getDuplicateDescription, getEditDescription, startDescription } from './utils/utils';

type PlanActionsDropdownItemsProps = {
  isDetailsPage?: boolean;
  plan: V1beta1Plan;
};

const PlanActionsDropdownItems: FC<PlanActionsDropdownItemsProps> = ({ isDetailsPage, plan }) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();
  const navigate = useNavigate();

  const { canDelete } = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace: getNamespace(plan),
  });

  const planURL = getPlanURL(plan);
  const planStatus = getPlanStatus(plan);

  const canStart = canPlanStart(plan);
  const canReStart = canPlanReStart(plan);
  const canResume = canPlanResumeConversion(plan);
  const isWarmAndExecuting = getPlanIsWarm(plan) && isPlanExecuting(plan);
  const isArchived = isPlanArchived(plan);
  const buttonStartLabel = canReStart ? t('Restart') : t('Start');
  const canScheduleCutover =
    isWarmAndExecuting && !isArchived && planStatus !== PlanStatuses.Pending;

  const [activeMigration, migrationLoaded] = usePlanMigration(plan);
  const hasCutover = canScheduleCutover && Boolean(activeMigration?.spec?.cutover);

  const onClickPlanStart = () => {
    launchOverlay<PlanStartMigrationModalProps>(PlanStartMigrationModal, {
      plan,
      title: buttonStartLabel,
    });
  };

  const onClickResumeConversion = () => {
    launchOverlay<PlanResumeConversionModalProps>(PlanResumeConversionModal, { plan });
  };

  const onClickPlanCutover = () => {
    launchOverlay<PlanModalProps>(PlanCutoverMigrationModal, { plan });
  };

  const onClickDuplicate = () => {
    launchOverlay<PlanModalProps>(DuplicateModal, { plan });
  };

  const onClickArchive = () => {
    launchOverlay<PlanModalProps>(ArchiveModal, { plan });
  };

  const onClickPlanDelete = () => {
    launchOverlay<PlanModalProps>(PlanDeleteModal, { plan });
  };

  return (
    <DropdownList>
      <DropdownItem
        description={isDetailsPage ? undefined : getEditDescription(planStatus)}
        isDisabled={
          !isDetailsPage &&
          [
            PlanStatuses.Executing,
            PlanStatuses.Paused,
            PlanStatuses.Pending,
            PlanStatuses.Archived,
          ].includes(planStatus)
        }
        key="edit"
        onClick={() => {
          navigate(isDetailsPage ? `${planURL}/yaml` : planURL)?.catch(() => undefined);
        }}
        value={0}
      >
        {isDetailsPage ? t('Edit YAML') : t('Edit')}
      </DropdownItem>
      <DropdownItem
        data-testid="plan-actions-start-menuitem"
        description={startDescription[planStatus]}
        isDisabled={
          (!canStart && !canReStart) ||
          !isEmpty(activeMigration) ||
          PlanStatuses.CannotStart === planStatus
        }
        key="start"
        onClick={isEmpty(activeMigration) ? onClickPlanStart : undefined}
        value={1}
      >
        {buttonStartLabel}
      </DropdownItem>
      <DropdownItem
        data-testid="plan-actions-resume-conversion-menuitem"
        description={t('Re-run conversion using previously copied disks')}
        isDisabled={!migrationLoaded || !canResume || !isEmpty(activeMigration)}
        key="resume-conversion"
        onClick={onClickResumeConversion}
        value={2}
      >
        {t('Resume conversion')}
      </DropdownItem>
      <DropdownItem
        isDisabled={!canScheduleCutover}
        key="cutover"
        onClick={onClickPlanCutover}
        value={3}
      >
        {hasCutover ? t('Edit cutover') : t('Schedule cutover')}
      </DropdownItem>
      <DropdownItem
        description={getDuplicateDescription(planStatus)}
        isDisabled={planStatus === PlanStatuses.CannotStart}
        key="duplicate"
        onClick={onClickDuplicate}
        value={4}
      >
        {t('Duplicate')}
      </DropdownItem>
      <DropdownItem
        isDisabled={!canDelete || planStatus === PlanStatuses.Archived}
        key="archive"
        onClick={onClickArchive}
        value={5}
      >
        {t('Archive')}
      </DropdownItem>
      <DropdownItem isDisabled={!canDelete} key="delete" onClick={onClickPlanDelete} value={6}>
        {t('Delete')}
      </DropdownItem>
    </DropdownList>
  );
};

export default PlanActionsDropdownItems;
