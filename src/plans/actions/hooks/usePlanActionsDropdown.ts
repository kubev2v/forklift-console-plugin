import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';

import { PlanModel, type V1beta1Plan } from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { getNamespace } from '@utils/crds/common/selectors';
import { getPlanIsWarm } from '@utils/crds/plans/selectors';
import { getPlanURL } from '@utils/crds/plans/utils';
import { useForkliftTranslation } from '@utils/i18n';

import { PlanStatuses } from '../../details/components/PlanStatus/utils/types';
import {
  canPlanReStart,
  canPlanResumeConversion,
  canPlanStart,
  getPlanStatus,
  isPlanArchived,
  isPlanExecuting,
} from '../../details/components/PlanStatus/utils/utils';
import { usePlanMigration } from '../../hooks/usePlanMigration';
import ArchiveModal from '../components/ArchiveModal';
import PlanCutoverMigrationModal from '../components/CutoverModal/PlanCutoverMigrationModal';
import DuplicateModal from '../components/DuplicateModal/DuplicateModal';
import PlanDeleteModal from '../components/PlanDeleteModal';
import PlanResumeConversionModal, {
  type PlanResumeConversionModalProps,
} from '../components/ResumeConversionModal/PlanResumeConversionModal';
import PlanStartMigrationModal, {
  type PlanStartMigrationModalProps,
} from '../components/StartPlanModal/PlanStartMigrationModal';
import type { PlanModalProps } from '../components/types';

type UsePlanActionsDropdownResult = {
  activeMigration: ReturnType<typeof usePlanMigration>[0];
  buttonStartLabel: string;
  canDelete: boolean;
  canReStart: boolean;
  canResume: boolean;
  canScheduleCutover: boolean;
  canStart: boolean;
  hasCutover: boolean;
  migrationLoaded: boolean;
  onClickArchive: () => void;
  onClickDuplicate: () => void;
  onClickPlanCutover: () => void;
  onClickPlanDelete: () => void;
  onClickPlanStart: () => void;
  onClickResumeConversion: () => void;
  planStatus: PlanStatuses;
  planURL: string;
};

export const usePlanActionsDropdown = (plan: V1beta1Plan): UsePlanActionsDropdownResult => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();

  const { canDelete } = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace: getNamespace(plan),
  });

  const planURL = getPlanURL(plan);
  const planStatus = getPlanStatus(plan);

  const canStart = canPlanStart(plan);
  const canReStart = canPlanReStart(plan);
  const canResume = canPlanResumeConversion(plan);
  const isWarmAndExecuting = Boolean(getPlanIsWarm(plan)) && isPlanExecuting(plan);
  const isArchived = isPlanArchived(plan);
  const buttonStartLabel = canReStart ? t('Restart') : t('Start');
  const canScheduleCutover =
    isWarmAndExecuting && !isArchived && planStatus !== PlanStatuses.Pending;

  const [activeMigration, migrationLoaded] = usePlanMigration(plan);
  const hasCutover = canScheduleCutover && Boolean(activeMigration?.spec?.cutover);

  return {
    activeMigration,
    buttonStartLabel,
    canDelete,
    canReStart,
    canResume,
    canScheduleCutover,
    canStart,
    hasCutover,
    migrationLoaded,
    onClickArchive: (): void => {
      launchOverlay<PlanModalProps>(ArchiveModal, { plan });
    },
    onClickDuplicate: (): void => {
      launchOverlay<PlanModalProps>(DuplicateModal, { plan });
    },
    onClickPlanCutover: (): void => {
      launchOverlay<PlanModalProps>(PlanCutoverMigrationModal, { plan });
    },
    onClickPlanDelete: (): void => {
      launchOverlay<PlanModalProps>(PlanDeleteModal, { plan });
    },
    onClickPlanStart: (): void => {
      launchOverlay<PlanStartMigrationModalProps>(PlanStartMigrationModal, {
        plan,
        title: buttonStartLabel,
      });
    },
    onClickResumeConversion: (): void => {
      launchOverlay<PlanResumeConversionModalProps>(PlanResumeConversionModal, { plan });
    },
    planStatus,
    planURL,
  };
};
