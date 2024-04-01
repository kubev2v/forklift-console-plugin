import React from 'react';
import { DropdownItemLink } from 'src/components/actions/DropdownItemLink';
import { useModal } from 'src/modules/Providers/modals';
import { getResourceUrl } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, PlanModelRef } from '@kubev2v/types';
import { DropdownItem } from '@patternfly/react-core';

import {
  ArchiveModal,
  DuplicateModal,
  PlanCutoverMigrationModal,
  PlanDeleteModal,
  PlanStartMigrationModal,
} from '../modals';
import { canPlanReStart, canPlanStart, getPlanPhase, isPlanExecuting, PlanData } from '../utils';

export const PlanActionsDropdownItems = ({ data }: PlanActionsDropdownItemsProps) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const { obj: plan } = data;

  const planURL = getResourceUrl({
    reference: PlanModelRef,
    name: plan?.metadata?.name,
    namespace: plan?.metadata?.namespace,
  });

  const phase = getPlanPhase(data);

  const canStart = canPlanStart(plan);
  const canReStart = canPlanReStart(plan);
  const isWarmAndExecuting = plan?.spec?.warm && isPlanExecuting(plan);

  const buttonStartLabel = canReStart ? t('Restart migration') : t('Start migration');

  return [
    <DropdownItemLink key="EditPlan" href={planURL}>
      {t('Edit Plan')}
    </DropdownItemLink>,

    <DropdownItem
      key="start"
      isDisabled={!canStart}
      onClick={() =>
        showModal(
          <PlanStartMigrationModal resource={plan} model={PlanModel} title={buttonStartLabel} />,
        )
      }
    >
      {buttonStartLabel}
    </DropdownItem>,

    <DropdownItem
      key="cutover"
      isDisabled={!isWarmAndExecuting}
      onClick={() => showModal(<PlanCutoverMigrationModal resource={plan} />)}
    >
      {t('Cutover')}
    </DropdownItem>,

    <DropdownItem
      key="duplicate"
      isDisabled={!data?.permissions?.canDelete}
      onClick={() => showModal(<DuplicateModal resource={plan} model={PlanModel} />)}
    >
      {t('Duplicate Plan')}
    </DropdownItem>,

    <DropdownItem
      key="archive"
      isDisabled={!data?.permissions?.canDelete || ['Archived', 'Archiving'].includes(phase)}
      onClick={() => showModal(<ArchiveModal resource={plan} model={PlanModel} />)}
    >
      {t('Archive Plan')}
    </DropdownItem>,

    <DropdownItem
      key="delete"
      isDisabled={!data?.permissions?.canDelete}
      onClick={() => showModal(<PlanDeleteModal resource={plan} model={PlanModel} />)}
    >
      {t('Delete Plan')}
    </DropdownItem>,
  ];
};

interface PlanActionsDropdownItemsProps {
  data: PlanData;
}
