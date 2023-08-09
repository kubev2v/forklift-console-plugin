import React, { useCallback, useMemo, useState } from 'react';
import { Trans } from 'react-i18next';
import { useForkliftTranslation } from 'src/utils/i18n';

import { withActionServiceContext } from '@kubev2v/common';
import { withQueryClient } from '@kubev2v/common';
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
import { PlanModel } from '@kubev2v/types';
import {
  type ExtensionHook,
  Action,
  useAccessReview,
  useModal,
} from '@openshift-console/dynamic-plugin-sdk';
import { Alert, Button, Modal, Stack, Text, TextContent } from '@patternfly/react-core';

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

/**
 * Take an `ActionServiceProvider` provided context and return a set of actions to be
 * rendered.
 */
export const useFlatPlanActions: ExtensionHook<
  Action[],
  {
    /** Resource the actions will act upon. */
    resourceData: FlatPlan;
  }
> = ({ resourceData: plan }) => {
  const { migrationStarted, migrationCompleted, archived: isPlanArchived, name, namespace } = plan;
  const isPlanStarted = !!migrationStarted;
  const { t } = useForkliftTranslation();
  const launchModal = useModal();
  const {
    withNs,
    withoutNs,
    mustGathersQuery,
    setMustGatherModalOpen,
    setActiveMustGather,
    latestAssociatedMustGather,
    downloadMustGatherResult,
    fetchMustGatherResult,
    notifyDownloadFailed,
  } = React.useContext(MustGatherContext);
  const mustGather = latestAssociatedMustGather(
    withNs(plan.name, plan?.object?.metadata?.uid || '', 'plan'),
  );
  const cutoverMutation = useSetCutoverMutation(plan.namespace);

  const [canDelete] = useAccessReview({
    group: PlanModel.apiGroup,
    resource: PlanModel.plural,
    verb: 'delete',
    name,
    namespace,
  });

  const [canPatch] = useAccessReview({
    group: PlanModel.apiGroup,
    resource: PlanModel.plural,
    verb: 'patch',
    name,
    namespace,
  });

  const isPlanGathering = mustGather?.status === 'inprogress' || mustGather?.status === 'new';
  const areProvidersReady = plan.sourceReady && plan.targetReady;
  const editingDisabled =
    !canPatch || isPlanStarted || !areProvidersReady || isPlanArchived || isPlanGathering;
  const isPlanExecuting = hasCondition(plan.object.status?.conditions ?? [], 'Executing');
  const isPlanCompleted =
    !plan.status?.toLowerCase().includes('finished') &&
    !plan.status?.toLowerCase().includes('failed') &&
    !plan.status?.toLowerCase().includes('canceled');

  const isArchivingInProgress = plan.status === 'Archiving';
  const deleteDisabled = !canDelete;
  const canRestart = canBeRestarted(plan.status);
  const cutoverScheduled = plan.status == 'Copying-CutoverScheduled';

  const isMustGatherReachable = true; // TODO: Figure out how to determine this at runtime.
  const isMustGatherDownloadable =
    mustGather?.status === 'completed' && mustGather?.['archive-name'];

  const mustGatherDownloadLogsAction: Action = useMemo(
    () =>
      isMustGatherReachable &&
      isMustGatherDownloadable && {
        id: 'MustGather',
        label: 'Download logs',
        description: `Download logs for ${name}`,
        disabled: !mustGathersQuery?.isSuccess,
        disabledTooltip: 'Cannot reach must gather service.',
        tooltip: `must-gather-plan_${name} available for download.`,
        cta: () => {
          fetchMustGatherResult(mustGather)
            .then(
              (tarBall) => tarBall && downloadMustGatherResult(tarBall, mustGather['archive-name']),
            )
            .catch(() => notifyDownloadFailed());
        },
      },
    [
      isMustGatherReachable,
      isMustGatherDownloadable,
      mustGather,
      mustGathersQuery,
      name,
      fetchMustGatherResult,
      downloadMustGatherResult,
      notifyDownloadFailed,
    ],
  );

  const mustGatherGetLogsAction: Action = useMemo(
    () =>
      isMustGatherReachable &&
      !isMustGatherDownloadable && {
        id: 'MustGather',
        label: mustGather?.status === 'completed' ? 'Download logs' : 'Get logs',
        disabled:
          mustGather?.status === 'inprogress' ||
          mustGather?.status === 'new' ||
          mustGather?.status === 'error' ||
          !mustGathersQuery?.isSuccess ||
          !migrationCompleted,
        disabledTooltip:
          mustGather?.status === 'inprogress'
            ? 'Collecting migration plan logs.'
            : mustGather?.status === 'new'
            ? 'Must gather queued for execution.'
            : mustGather?.status === 'error'
            ? `Cannot complete must gather for ${withoutNs(mustGather?.['custom-name'])}`
            : !mustGathersQuery?.isSuccess
            ? 'Cannot reach must gather service.'
            : !migrationCompleted
            ? 'Cannot run must gather until the migration is finished.'
            : undefined,
        tooltip:
          'Collects the current migration plan logs and creates a tar archive file for download.',
        cta: () => {
          setMustGatherModalOpen(true);
          setActiveMustGather({
            type: 'plan',
            planUid: plan?.object?.metadata?.uid || '',
            displayName: name,
            status: 'new',
          });
        },
      },
    [
      isMustGatherReachable,
      isMustGatherDownloadable,
      mustGather,
      mustGathersQuery,
      migrationCompleted,
      name,
      withoutNs,
      setMustGatherModalOpen,
      setActiveMustGather,
    ],
  );

  const editAction = useMemo(
    () => ({
      id: 'edit',
      cta: {
        href: `${PATH_PREFIX}/plans/ns/${namespace}/${name}/edit`,
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
        href: `${PATH_PREFIX}/plans/ns/${namespace}/${name}/duplicate`,
      },
      label: t('Duplicate'),
      disabled: !canPatch || !areProvidersReady,
      disabledTooltip: !areProvidersReady
        ? t(
            'This plan cannot be duplicated because the inventory data for its associated providers is not ready.',
          )
        : '',
    }),
    [t, canPatch, areProvidersReady, name, namespace],
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
      cta: () =>
        launchModal(withQueryClient(DeleteModal), {
          plan,
          isPlanStarted,
          isPlanArchived,
          isPlanExecuting,
        }),
      disabled: deleteDisabled,
      label: t('Delete'),
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

  const actions: Action[] = useMemo(
    () =>
      [
        mustGatherDownloadLogsAction,
        mustGatherGetLogsAction,
        editAction,
        duplicateAction,
        archiveAction,
        deleteAction,
        detailsAction,
        restartAction,
        cancelCutoverAction,
      ].filter(Boolean),
    [
      mustGatherDownloadLogsAction,
      mustGatherGetLogsAction,
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
  isPlanArchived,
  isPlanExecuting,
  isPlanStarted,
}: {
  plan: FlatPlan;
  closeModal: () => void;
  isPlanArchived: boolean;
  isPlanExecuting: boolean;
  isPlanStarted: boolean;
}) => {
  const { t } = useForkliftTranslation();
  const [isOpen, setIsOpen] = useState(true);

  const exit = useCallback(() => {
    setIsOpen(false);
    closeModal();
  }, [closeModal, setIsOpen]);

  const deletePlanMutation = useDeletePlanMutation(plan.namespace, exit);

  const IsExecutingAlert = <Alert isInline variant="danger" title="Plan is currently running" />;
  const IsNotArchivedAlert = (
    <Alert isInline variant="info" title="Plan is not archived">
      <Trans t={t} ns="plugin__forklift-console-plugin">
        Deleting a migration plan does not remove temporary resources, it is recommended to{' '}
        <strong>archive</strong> the plan first before deleting it, to remove temporary resources.
      </Trans>
    </Alert>
  );

  return (
    <ConfirmModal
      titleIconVariant="warning"
      confirmButtonVariant="danger"
      position="top"
      isOpen={isOpen}
      toggleOpen={exit}
      mutateFn={() => deletePlanMutation.mutate(plan.object)}
      mutateResult={deletePlanMutation}
      title={t('Delete Plan?')}
      confirmButtonText={t('Delete')}
      body={
        <Stack hasGutter>
          {isPlanExecuting ? IsExecutingAlert : ''}
          {isPlanArchived || !isPlanStarted ? '' : IsNotArchivedAlert}
          <TextContent>
            <Trans t={t} ns="plugin__forklift-console-plugin">
              Are you sure you want to delete{' '}
              <strong className="co-break-word">{{ resourceName: plan.name }}</strong> in namespace{' '}
              <strong>{{ namespace: plan.namespace }}</strong>?
            </Trans>
          </TextContent>
        </Stack>
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
  const { t } = useForkliftTranslation();
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
  const { t } = useForkliftTranslation();
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

/**
 * Use the `console.action/provider` extension named `forklift-flat-plan` to render
 * a set of actions in a kebab menu.
 */
export const PlanActions = withActionServiceContext<FlatPlan>({
  contextId: 'forklift-flat-plan',
  variant: 'kebab',
});
PlanActions.displayName = 'PlanActions';
