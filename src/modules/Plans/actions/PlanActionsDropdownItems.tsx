import React, { useEffect, useState } from 'react';
import { DropdownItemLink } from 'src/components/actions/DropdownItemLink';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, PlanModelRef } from '@kubev2v/types';
import { DropdownItem } from '@patternfly/react-core';

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
import type { PlanData } from '../utils/types/PlanData';
import { PlanPhase } from '../utils/types/PlanPhase';

export const PlanActionsDropdownItems = ({ data }: PlanActionsDropdownItemsProps) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const { plan } = data;

  const planURL = getResourceUrl({
    name: plan?.metadata?.name,
    namespace: plan?.metadata?.namespace,
    reference: PlanModelRef,
  });

  const phase = getPlanPhase(data);

  const canStart = canPlanStart(plan);
  const canReStart = canPlanReStart(plan);
  const isWarmAndExecuting = plan?.spec?.warm && isPlanExecuting(plan);
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

  return [
    <DropdownItemLink value={0} key="EditPlan" href={planURL} description={t('Edit Plan')} />,

    <DropdownItem
      value={1}
      key="start"
      isDisabled={!canStart || !isStartItemEnabled}
      onClick={onClickPlanStart}
    >
      {buttonStartLabel}
    </DropdownItem>,

    <DropdownItem
      value={2}
      key="cutover"
      isDisabled={!isWarmAndExecuting || isArchived}
      onClick={onClickPlanCutover}
    >
      {t('Cutover')}
    </DropdownItem>,

    <DropdownItem
      value={3}
      key="duplicate"
      isDisabled={!data?.permissions?.canDelete}
      onClick={onClickDuplicate}
    >
      {t('Duplicate Plan')}
    </DropdownItem>,

    <DropdownItem
      value={4}
      key="archive"
      isDisabled={
        !data?.permissions?.canDelete || [PlanPhase.Archived, PlanPhase.Archiving].includes(phase)
      }
      onClick={onClickArchive}
    >
      {t('Archive Plan')}
    </DropdownItem>,

    <DropdownItem
      value={5}
      key="delete"
      isDisabled={!data?.permissions?.canDelete}
      onClick={onClickPlanDelete}
    >
      {t('Delete Plan')}
    </DropdownItem>,
  ];
};

type PlanActionsDropdownItemsProps = {
  data: PlanData;
};
