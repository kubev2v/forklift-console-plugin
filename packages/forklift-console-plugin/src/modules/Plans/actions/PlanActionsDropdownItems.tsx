import React from 'react';
import { DropdownItemLink } from 'src/components/actions/DropdownItemLink';
import { useModal } from 'src/modules/Providers/modals';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, PlanModelRef } from '@kubev2v/types';
import { DropdownItem } from '@patternfly/react-core';

import { ArchiveModal, DuplicateModal, PlanDeleteModal, PlanStartMigrationModal } from '../modals';
import {
  canPlanReStart,
  canPlanStart,
  getPlanSummaryStatus,
  PlanData,
  PlanSummaryStatus,
} from '../utils';

export const PlanActionsDropdownItems = ({ data }: PlanActionsDropdownItemsProps) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const { obj: plan } = data;

  const planURL = getResourceUrl({
    reference: PlanModelRef,
    name: plan?.metadata?.name,
    namespace: plan?.metadata?.namespace,
  });

  const status = getPlanSummaryStatus(data);
  const canStart = canPlanStart(plan);
  const canReStart = canPlanReStart(plan);
  const isPlanValidating = !status;

  const buttonStartLabel = canReStart ? t('Restart migration') : t('Start migration');

  const onClickPlanStart = () => {
    showModal(
      <PlanStartMigrationModal resource={plan} model={PlanModel} title={buttonStartLabel} />,
    );
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

  const startActionDescription = React.useMemo(() => {
    if (isPlanValidating) {
      return t('The plan is being validated');
    }

    switch (status) {
      case PlanSummaryStatus.Archived:
        return t('Archived plans cannot be started');
      case PlanSummaryStatus.Complete:
        return t('All VMs were migrated');
      case PlanSummaryStatus.Running:
        return t('The plan is currently in progress');
      case PlanSummaryStatus.CannotStart:
        return t('The plan cannot be started');
    }
  }, [status, isPlanValidating]);

  const duplicateActionDescription = React.useMemo(() => {
    if (isPlanValidating) {
      return t('The plan is being validated');
    }

    if (status === PlanSummaryStatus.CannotStart) {
      return t('The plan cannot be duplicated');
    }
  }, [status, isPlanValidating]);

  return [
    <DropdownItem
      value={0}
      key="start"
      isDisabled={!canStart}
      onClick={onClickPlanStart}
      description={startActionDescription}
    >
      {buttonStartLabel}
    </DropdownItem>,

    <DropdownItemLink
      value={1}
      key="EditPlan"
      href={planURL}
      description={status === PlanSummaryStatus.Archived && t('Archived plans cannot be edited')}
    >
      {t('Edit Plan')}
    </DropdownItemLink>,

    <DropdownItem
      value={2}
      key="duplicate"
      isDisabled={
        !data?.permissions?.canDelete ||
        status === PlanSummaryStatus.CannotStart ||
        isPlanValidating
      }
      onClick={onClickDuplicate}
      description={duplicateActionDescription}
    >
      {t('Duplicate Plan')}
    </DropdownItem>,

    <DropdownItem
      value={3}
      key="archive"
      isDisabled={!data?.permissions?.canDelete || status === PlanSummaryStatus.Archived}
      onClick={onClickArchive}
      description={status === PlanSummaryStatus.Archived && t('The plan is already archived')}
    >
      {t('Archive Plan')}
    </DropdownItem>,

    <DropdownItem
      value={4}
      key="delete"
      isDisabled={!data?.permissions?.canDelete}
      onClick={onClickPlanDelete}
    >
      {t('Delete Plan')}
    </DropdownItem>,
  ];
};

interface PlanActionsDropdownItemsProps {
  data: PlanData;
}
