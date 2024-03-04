import React from 'react';
import { DropdownItemLink } from 'src/components/actions/DropdownItemLink';
import { useModal } from 'src/modules/Providers/modals';
import { getResourceUrl } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, PlanModelRef } from '@kubev2v/types';
import { DropdownItem } from '@patternfly/react-core';

import { ArchiveModal, DuplicateModal, PlanDeleteModal, PlanStartMigrationModal } from '../modals';
import { getPlanPhase, PlanData } from '../utils';

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

  return [
    <DropdownItemLink key="EditPlan" href={planURL}>
      {t('Edit Plan')}
    </DropdownItemLink>,
    <DropdownItem
      key="start"
      isDisabled={!['Ready', 'Warning', 'Canceled', 'Failed'].includes(phase)}
      onClick={() => showModal(<PlanStartMigrationModal resource={plan} model={PlanModel} />)}
    >
      {t('Start migration')}
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
