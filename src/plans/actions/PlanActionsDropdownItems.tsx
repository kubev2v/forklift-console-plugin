import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Plan } from '@forklift-ui/types';
import { DropdownItem, DropdownList } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import { PlanStatuses } from '../details/components/PlanStatus/utils/types';

import { usePlanActionsDropdown } from './hooks/usePlanActionsDropdown';
import { getDuplicateDescription, getEditDescription, startDescription } from './utils/utils';

type PlanActionsDropdownItemsProps = {
  isDetailsPage?: boolean;
  plan: V1beta1Plan;
};

const PlanActionsDropdownItems: FC<PlanActionsDropdownItemsProps> = ({ isDetailsPage, plan }) => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();

  const {
    activeMigration,
    buttonStartLabel,
    canDelete,
    canReStart,
    canResume,
    canScheduleCutover,
    canStart,
    hasCutover,
    migrationLoaded,
    onClickArchive,
    onClickDuplicate,
    onClickPlanCutover,
    onClickPlanDelete,
    onClickPlanStart,
    onClickResumeConversion,
    planStatus,
    planURL,
  } = usePlanActionsDropdown(plan);

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
