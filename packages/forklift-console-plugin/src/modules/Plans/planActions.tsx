import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'src/utils/i18n';

import { withActionContext } from '@kubev2v/common/components/ActionServiceDropdown';
import withQueryClient from '@kubev2v/common/components/QueryClientHoc';
import { useModal } from '@kubev2v/common/polyfills/sdk-shim';
import { ConfirmModal } from '@kubev2v/legacy/common/components/ConfirmModal';
import { PATH_PREFIX } from '@kubev2v/legacy/common/constants';
import { MustGatherContext } from '@kubev2v/legacy/common/context';
import { hasCondition } from '@kubev2v/legacy/common/helpers';
import { canBeRestarted } from '@kubev2v/legacy/Plans/components/helpers';
import { MigrationConfirmModal } from '@kubev2v/legacy/Plans/components/MigrationConfirmModal';
import { PlanDetailsModal } from '@kubev2v/legacy/Plans/components/PlanDetailsModal';
import {
  useArchivePlanMutation,
  useCreateMigrationMutation,
  useDeletePlanMutation,
  useSetCutoverMutation,
} from '@kubev2v/legacy/queries';
import { Button, Modal, Text, TextContent } from '@patternfly/react-core';

import { type FlatPlan } from './data';

const editingDisabledTooltip = ({
  t,
  isPlanGathering,
  areProvidersReady,
  isPlanStarted,
  isPlanArchived,
}) => {
  const duplicateMessageOnDisabledEdit = t(
    'To make changes to the plan, select Duplicate and edit the duplicate plan.',
  );
  if (isPlanGathering) {
    return `${t(
      'This plan cannot be edited because it is running must gather.',
    )} ${duplicateMessageOnDisabledEdit}`;
  } else if (isPlanArchived) {
    return `${t(
      'This plan cannot be edited because it has been archived.',
    )} ${duplicateMessageOnDisabledEdit}`;
  } else if (isPlanStarted) {
    return `${t(
      'This plan cannot be edited because it has been started.',
    )} ${duplicateMessageOnDisabledEdit}`;
  } else if (!areProvidersReady) {
    return t(
      'This plan cannot be edited because the inventory data for its associated providers is not ready.',
    );
  }
  return '';
};

const deleteDisabledTooltip = ({ t, isPlanExecuting, isPlanGathering, isArchivingInProgress }) => {
  if (isPlanExecuting) {
    return t('This plan cannot be deleted because it is running');
  } else if (isPlanGathering) {
    t('This plan cannot be deleted because it is running must gather service');
  } else if (isArchivingInProgress) {
    return t('This plan cannot be deleted because it is being archived');
  }
  return '';
};

export const useFlatPlanActions = ({
  entity: plan,
  namespace,
}: {
  entity: FlatPlan;
  namespace: string;
}) => {
  const { migrationStarted, archived: isPlanArchived, name } = plan;
  const isPlanStarted = !!migrationStarted;
  const { t } = useTranslation();
  const launchModal = useModal();
  const { withNs, latestAssociatedMustGather } = React.useContext(MustGatherContext);
  const mustGather = latestAssociatedMustGather(withNs(plan.name, 'plan'));
  const cutoverMutation = useSetCutoverMutation(plan.namespace);

  const isPlanGathering = mustGather?.status === 'inprogress' || mustGather?.status === 'new';
  const areProvidersReady = plan.sourceReady && plan.targetReady;
  const editingDisabled = isPlanStarted || !areProvidersReady || isPlanArchived || isPlanGathering;
  const isPlanExecuting = hasCondition(plan.object.status?.conditions ?? [], 'Executing');
  const isPlanCompleted =
    !plan.status?.toLowerCase().includes('finished') &&
    !plan.status?.toLowerCase().includes('failed') &&
    !plan.status?.toLowerCase().includes('canceled');

  const isArchivingInProgress = plan.status === 'Archiving';
  // previously the check included isDeleteInProgress === deletePlanMutation.isLoading
  const deleteDisabled = isPlanGathering || isArchivingInProgress || isPlanExecuting;
  const canRestart = canBeRestarted(plan.status);
  const cutoverScheduled = plan.status == 'Copying-CutoverScheduled';

  const editAction = useMemo(
    () => ({
      id: 'edit',
      cta: {
        href: namespace
          ? `${PATH_PREFIX}/plans/ns/${namespace}/${name}/edit`
          : `${PATH_PREFIX}/plans/${name}/edit`,
      },
      label: t('Edit'),
      disabled: editingDisabled,
      disabledTooltip: editingDisabledTooltip({
        t,
        isPlanArchived,
        isPlanStarted,
        isPlanGathering,
        areProvidersReady,
      }),
    }),
    [
      t,
      editingDisabled,
      isPlanArchived,
      isPlanStarted,
      isPlanGathering,
      areProvidersReady,
      name,
      namespace,
    ],
  );

  const duplicateAction = useMemo(
    () => ({
      id: 'duplicate',
      cta: {
        href: namespace
          ? `${PATH_PREFIX}/plans/ns/${namespace}/${name}/duplicate`
          : `${PATH_PREFIX}/plans/${name}/duplicate`,
      },
      label: t('Duplicate'),
      disabled: !areProvidersReady,
      disabledTooltip: !areProvidersReady
        ? t(
            'This plan cannot be duplicated because the inventory data for its associated providers is not ready.',
          )
        : '',
    }),
    [t, areProvidersReady, name, namespace],
  );

  const archiveAction = useMemo(
    () =>
      !isPlanArchived && {
        id: 'archive',
        cta: () => launchModal(withQueryClient(ArchiveModal), { plan }),
        label: t('Archive'),
        disabled: isPlanCompleted,
        disabledTooltip: isPlanCompleted
          ? t('This plan cannot be archived because it is not completed.')
          : '',
      },
    [t, launchModal, isPlanCompleted, isPlanArchived, plan],
  );

  const deleteAction = useMemo(
    () => ({
      id: 'delete',
      cta: () => launchModal(withQueryClient(DeleteModal), { plan, isPlanStarted, isPlanArchived }),
      label: t('Delete'),
      disabled: deleteDisabled,
      disabledTooltip: deleteDisabledTooltip({
        t,
        isPlanGathering,
        isPlanExecuting,
        isArchivingInProgress,
      }),
    }),
    [
      t,
      launchModal,
      plan,
      deleteDisabled,
      isPlanStarted,
      isPlanArchived,
      isPlanGathering,
      isPlanExecuting,
      isArchivingInProgress,
    ],
  );

  const detailsAction = useMemo(
    () => ({
      id: 'details',
      cta: () => launchModal(withQueryClient(DetailsModal), { plan }),
      label: t('View details'),
    }),
    [t, launchModal, plan],
  );

  const restartAction = useMemo(
    () =>
      canRestart && {
        id: 'restart',
        cta: () => launchModal(withQueryClient(RestartModal), { plan }),
        label: t('Restart'),
        disabled: isPlanGathering,
        disabledTooltip: isPlanGathering
          ? t('This plan cannot be restarted because it is running must gather service')
          : '',
      },
    [launchModal, plan, t, isPlanGathering, canRestart],
  );

  const cancelCutoverAction = useMemo(
    () =>
      cutoverScheduled && {
        id: 'cancelCutover',
        cta: () => cutoverMutation.mutate({ plan: plan.object, cutover: null }),
        label: t('Cancel scheduled cutover'),
      },
    [plan, t, cutoverScheduled],
  );
  const actions = useMemo(
    () =>
      [
        editAction,
        duplicateAction,
        archiveAction,
        deleteAction,
        detailsAction,
        restartAction,
        cancelCutoverAction,
      ].filter(Boolean),
    [
      editAction,
      duplicateAction,
      archiveAction,
      deleteAction,
      detailsAction,
      restartAction,
      cancelCutoverAction,
    ],
  );

  return [actions, true, undefined];
};

const DeleteModal = ({
  plan,
  closeModal,
  isPlanStarted,
  isPlanArchived,
}: {
  plan: FlatPlan;
  closeModal: () => void;
  isPlanStarted: boolean;
  isPlanArchived: boolean;
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);

  const exit = useCallback(() => {
    setIsOpen(false);
    closeModal();
  }, [closeModal, setIsOpen]);

  const deletePlanMutation = useDeletePlanMutation(plan.namespace, exit);
  return (
    <ConfirmModal
      titleIconVariant="warning"
      confirmButtonVariant="danger"
      position="top"
      isOpen={isOpen}
      toggleOpen={exit}
      mutateFn={() => deletePlanMutation.mutate(plan.object)}
      mutateResult={deletePlanMutation}
      title={t('Permanently delete migration plan?')}
      confirmButtonText={t('Delete')}
      body={
        isPlanStarted && !isPlanArchived ? (
          <TextContent>
            <Text>
              {t(
                'Migration plan "{{name}}" will be deleted. However, deleting a migration plan does not remove temporary resources such as failed VMs and data volumes, conversion pods, importer pods, secrets, or config maps.',
                { name: plan.name },
              )}
            </Text>
            <Text>{t('To clean up these resources, archive the plan before deleting it.')}</Text>
          </TextContent>
        ) : (
          <>{t('All data for migration plan "{{name}}" will be lost.', { name: plan.name })}</>
        )
      }
      errorText={t('Cannot delete migration plan')}
    />
  );
};
DeleteModal.displayName = 'DeleteModal';

const RestartModal = ({ plan, closeModal }: { plan: FlatPlan; closeModal: () => void }) => {
  const [isOpen, setIsOpen] = useState(true);

  const exit = useCallback(() => {
    setIsOpen(false);
    closeModal();
  }, [closeModal, setIsOpen]);

  const createMigrationMutation = useCreateMigrationMutation(plan.namespace, exit);
  return (
    <MigrationConfirmModal
      isOpen={isOpen}
      toggleOpen={exit}
      createMigrationMutation={createMigrationMutation}
      plan={plan.object}
      action="restart"
    />
  );
};
RestartModal.displayName = 'RestartModal';

const DetailsModal = ({ plan, closeModal }: { plan: FlatPlan; closeModal: () => void }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);

  const exit = useCallback(() => {
    setIsOpen(false);
    closeModal();
  }, [closeModal, setIsOpen]);

  return (
    <Modal
      variant="medium"
      title="Plan details"
      position="top"
      isOpen={isOpen}
      onClose={exit}
      actions={[
        <Button key="close" variant="primary" onClick={exit}>
          {t('Close')}
        </Button>,
      ]}
    >
      <PlanDetailsModal plan={plan.object} />
    </Modal>
  );
};
DetailsModal.displayName = 'DetailsModal';

const ArchiveModal = ({ plan, closeModal }: { plan: FlatPlan; closeModal: () => void }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);

  const exit = useCallback(() => {
    setIsOpen(false);
    closeModal();
  }, [closeModal, setIsOpen]);

  const archivePlanMutation = useArchivePlanMutation(plan.namespace, exit);
  return (
    <ConfirmModal
      position="top"
      isOpen={isOpen}
      toggleOpen={exit}
      mutateFn={() => archivePlanMutation.mutate(plan.object)}
      mutateResult={archivePlanMutation}
      title={t('Archive plan?')}
      body={
        <TextContent>
          <Text>{t('Archive plan "{{name}}" ?', { name: plan.name })}</Text>
          <Text>
            {t(
              'When a plan is archived, its history, metadata, and logs are deleted. The plan cannot be edited or restarted but it can be viewed.',
            )}
          </Text>
        </TextContent>
      }
      confirmButtonText={t('Archive')}
      errorText={t('Cannot archive plan')}
    />
  );
};
ArchiveModal.displayName = 'ArchiveModal';

export const PlanActions = withActionContext<FlatPlan>('kebab', 'forklift-flat-plan');
PlanActions.displayName = 'PlanActions';
