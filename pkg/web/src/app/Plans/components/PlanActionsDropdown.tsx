import * as React from 'react';
import {
  Dropdown,
  KebabToggle,
  DropdownItem,
  DropdownPosition,
  Modal,
  Button,
  TextContent,
  Text,
} from '@patternfly/react-core';
import { useHistory } from 'react-router-dom';

import { IPlan, IMigration } from '@app/queries/types';
import { hasCondition } from '@app/common/helpers';
import {
  useClusterProvidersQuery,
  useDeletePlanMutation,
  useArchivePlanMutation,
  useCreateMigrationMutation,
  useSetCutoverMutation,
} from '@app/queries';
import { MustGatherContext } from '@app/common/context';
import { ConfirmModal } from '@app/common/components/ConfirmModal';
import { ConditionalTooltip } from '@app/common/components/ConditionalTooltip';
import { areAssociatedProvidersReady } from '@app/queries/helpers';
import { PlanDetailsModal } from './PlanDetailsModal';
import { PATH_PREFIX, PlanState } from '@app/common/constants';
import { MigrationConfirmModal } from './MigrationConfirmModal';

interface IPlansActionDropdownProps {
  plan: IPlan;
  planState: PlanState | null;
  canRestart: boolean;
}

export const PlanActionsDropdown: React.FunctionComponent<IPlansActionDropdownProps> = ({
  plan,
  planState,
  canRestart,
}: IPlansActionDropdownProps) => {
  const namespace = plan.metadata.namespace;
  const { withNs, latestAssociatedMustGather } = React.useContext(MustGatherContext);

  const mustGather = latestAssociatedMustGather(withNs(plan.metadata.name, 'plan'));

  const isPlanGathering = mustGather?.status === 'inprogress' || mustGather?.status === 'new';

  const history = useHistory();
  const onMigrationStarted = (migration: IMigration) => {
    toggleRestartModal();
    history.push(`${PATH_PREFIX}/plans/${migration.spec.plan.name}`);
  };
  const createMigrationMutation = useCreateMigrationMutation(namespace, onMigrationStarted);
  const setCutoverMutation = useSetCutoverMutation(namespace);
  const [kebabIsOpen, setKebabIsOpen] = React.useState(false);
  const [isDeleteModalOpen, toggleDeleteModal] = React.useReducer((isOpen) => !isOpen, false);
  const [isRestartModalOpen, toggleRestartModal] = React.useReducer((isOpen) => !isOpen, false);
  const [isDetailsModalOpen, toggleDetailsModal] = React.useReducer((isOpen) => !isOpen, false);
  const [isArchivePlanModalOpen, toggleArchivePlanModal] = React.useReducer(
    (isOpen) => !isOpen,
    false
  );
  const deletePlanMutation = useDeletePlanMutation(namespace, toggleDeleteModal);
  const archivePlanMutation = useArchivePlanMutation(namespace, toggleArchivePlanModal);
  const conditions = plan.status?.conditions || [];
  const clusterProvidersQuery = useClusterProvidersQuery(namespace);
  const areProvidersReady = React.useMemo(
    () => kebabIsOpen && areAssociatedProvidersReady(clusterProvidersQuery, plan.spec.provider),
    [kebabIsOpen, clusterProvidersQuery, plan.spec.provider]
  );
  const isPlanStarted = !!plan.status?.migration?.started;

  const isPlanArchived = plan.spec.archived;
  const isPlanCompleted =
    !planState?.toLowerCase().includes('finished') &&
    !planState?.toLowerCase().includes('failed') &&
    !planState?.toLowerCase().includes('canceled');

  const duplicateMessageOnDisabledEdit =
    'To make changes to the plan, select Duplicate and edit the duplicate plan.';

  return (
    <>
      <Dropdown
        aria-label="Actions"
        toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
        isOpen={kebabIsOpen}
        isPlain
        dropdownItems={[
          <ConditionalTooltip
            key="edit"
            isTooltipEnabled={isPlanStarted || !areProvidersReady}
            content={
              isPlanGathering
                ? `This plan cannot be edited because it is running must gather. ${duplicateMessageOnDisabledEdit}`
                : isPlanArchived
                ? `This plan cannot be edited because it has been archived. ${duplicateMessageOnDisabledEdit}`
                : isPlanStarted
                ? `This plan cannot be edited because it has been started. ${duplicateMessageOnDisabledEdit}`
                : !areProvidersReady
                ? 'This plan cannot be edited because the inventory data for its associated providers is not ready.'
                : ''
            }
          >
            <DropdownItem
              isDisabled={isPlanStarted || !areProvidersReady || isPlanArchived || isPlanGathering}
              onClick={() => {
                setKebabIsOpen(false);
                history.push(`${PATH_PREFIX}/plans/${plan.metadata.name}/edit`);
              }}
            >
              Edit
            </DropdownItem>
          </ConditionalTooltip>,
          <ConditionalTooltip
            key="duplicate"
            isTooltipEnabled={!areProvidersReady}
            content="This plan cannot be duplicated because the inventory data for its associated providers is not ready."
          >
            <DropdownItem
              isDisabled={!areProvidersReady}
              onClick={() => {
                setKebabIsOpen(false);
                history.push(`${PATH_PREFIX}/plans/${plan.metadata.name}/duplicate`);
              }}
            >
              Duplicate
            </DropdownItem>
          </ConditionalTooltip>,
          ...(!isPlanArchived
            ? [
                <ConditionalTooltip
                  key="archive-tooltip"
                  isTooltipEnabled={isPlanCompleted}
                  content="This plan cannot be archived because it is not completed."
                >
                  <DropdownItem
                    isDisabled={isPlanCompleted || isPlanArchived}
                    key="archive"
                    onClick={() => {
                      setKebabIsOpen(false);
                      toggleArchivePlanModal();
                    }}
                  >
                    Archive
                  </DropdownItem>
                </ConditionalTooltip>,
              ]
            : []),
          <ConditionalTooltip
            key="Delete"
            isTooltipEnabled={
              hasCondition(conditions, 'Executing') ||
              deletePlanMutation.isLoading ||
              isPlanGathering ||
              planState === 'Archiving'
            }
            content={
              hasCondition(conditions, 'Executing')
                ? 'This plan cannot be deleted because it is running'
                : deletePlanMutation.isLoading
                ? 'This plan cannot be deleted because it is deleting'
                : isPlanGathering
                ? 'This plan cannot be deleted because it is running must gather service'
                : planState === 'Archiving'
                ? 'This plan cannot be deleted because it is being archived'
                : ''
            }
          >
            <DropdownItem
              isAriaDisabled={
                hasCondition(conditions, 'Executing') ||
                deletePlanMutation.isLoading ||
                isPlanGathering ||
                planState === 'Archiving'
              }
              onClick={() => {
                setKebabIsOpen(false);
                toggleDeleteModal();
              }}
            >
              Delete
            </DropdownItem>
          </ConditionalTooltip>,
          <DropdownItem
            key="Details"
            onClick={() => {
              setKebabIsOpen(false);
              toggleDetailsModal();
            }}
          >
            View details
          </DropdownItem>,
          ...(canRestart
            ? [
                <ConditionalTooltip
                  key="Restart"
                  isTooltipEnabled={isPlanGathering}
                  content="This plan cannot be restarted because it is running must gather service"
                >
                  <DropdownItem
                    isDisabled={isPlanGathering}
                    onClick={() => {
                      setKebabIsOpen(false);
                      toggleRestartModal();
                    }}
                  >
                    Restart
                  </DropdownItem>
                </ConditionalTooltip>,
              ]
            : []),
          ...(planState === 'Copying-CutoverScheduled'
            ? [
                <DropdownItem
                  key="Cancel cutover"
                  onClick={() => {
                    setKebabIsOpen(false);
                    setCutoverMutation.mutate({ plan, cutover: null });
                  }}
                >
                  Cancel scheduled cutover
                </DropdownItem>,
              ]
            : []),
        ]}
        position={DropdownPosition.right}
      />
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        toggleOpen={toggleDeleteModal}
        mutateFn={() => deletePlanMutation.mutate(plan)}
        mutateResult={deletePlanMutation}
        title="Permanently delete migration plan?"
        confirmButtonText="Delete"
        body={
          isPlanStarted && !isPlanArchived ? (
            <TextContent>
              <Text>
                Migration plan &quot;{plan.metadata.name}&quot; will be deleted. However, deleting a
                migration plan does not remove temporary resources such as failed VMs and data
                volumes, conversion pods, importer pods, secrets, or config maps.
              </Text>
              <Text>To clean up these resources, archive the plan before deleting it.</Text>
            </TextContent>
          ) : (
            <>All data for migration plan &quot;{plan.metadata.name}&quot; will be lost.</>
          )
        }
        errorText="Cannot delete migration plan"
      />
      {isRestartModalOpen ? (
        <MigrationConfirmModal
          isOpen
          toggleOpen={toggleRestartModal}
          createMigrationMutation={createMigrationMutation}
          plan={plan}
          action="restart"
        />
      ) : null}
      <Modal
        variant="medium"
        title="Plan details"
        isOpen={isDetailsModalOpen}
        onClose={toggleDetailsModal}
        actions={[
          <Button key="close" variant="primary" onClick={toggleDetailsModal}>
            Close
          </Button>,
        ]}
      >
        <PlanDetailsModal plan={plan} />
      </Modal>
      <ConfirmModal
        isOpen={isArchivePlanModalOpen}
        toggleOpen={toggleArchivePlanModal}
        mutateFn={() => archivePlanMutation.mutate(plan)}
        mutateResult={archivePlanMutation}
        title="Archive plan?"
        body={
          <TextContent>
            <Text>Archive plan &quot;{plan.metadata.name}&quot;?</Text>
            <Text>
              When a plan is archived, its history, metadata, and logs are deleted. The plan cannot
              be edited or restarted but it can be viewed.
            </Text>
          </TextContent>
        }
        confirmButtonText="Archive"
        errorText="Cannot archive plan"
      />
    </>
  );
};
