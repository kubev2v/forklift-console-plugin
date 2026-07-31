import { useCallback, useMemo } from 'react';
import { ItemIsOwnedAlert } from 'src/components/modals/ItemIsOwnedAlert';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import { PlanModel, type V1beta1Plan } from '@forklift-ui/types';
import { k8sDelete } from '@openshift-console/dynamic-plugin-sdk';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import {
  Alert,
  AlertVariant,
  ButtonVariant,
  List,
  ListItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { getName, getNamespace, getOwnerReference } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

import { MAX_PLANS_TO_LIST } from './constants';
import {
  getOwnedPlans,
  getPlanRowId,
  hasOwnedSelectedPlans,
  hasRunningSelectedPlans,
  hasUnarchivedSelectedPlans,
  runSettledInBatches,
} from './utils';

export type BulkDeletePlansModalProps = {
  plans: V1beta1Plan[];
  onComplete?: () => void;
};

const BulkDeletePlansModal: ModalComponent<BulkDeletePlansModalProps> = ({
  onComplete,
  plans,
  ...rest
}) => {
  const { t } = useForkliftTranslation();

  const hasRunning = useMemo(() => hasRunningSelectedPlans(plans), [plans]);
  const hasUnarchived = useMemo(() => hasUnarchivedSelectedPlans(plans), [plans]);
  const hasOwned = useMemo(() => hasOwnedSelectedPlans(plans), [plans]);
  const ownedPlans = useMemo(() => getOwnedPlans(plans), [plans]);

  const onDelete = useCallback(async () => {
    if (isEmpty(plans)) {
      throw new Error(t('Select at least one migration plan.'));
    }

    const results = await runSettledInBatches(plans, async (plan) =>
      k8sDelete({ model: PlanModel, resource: plan }),
    );

    const failed = results.filter((result) => result.status === 'rejected');
    if (!isEmpty(failed)) {
      throw new Error(
        t('Failed to delete {{count}} of {{total}} selected plans.', {
          count: failed.length,
          total: plans.length,
        }),
      );
    }

    onComplete?.();
  }, [onComplete, plans, t]);

  return (
    <ModalForm
      confirmVariant={ButtonVariant.danger}
      confirmLabel={t('Delete')}
      isDisabled={isEmpty(plans)}
      title={t('Delete migration plans')}
      onConfirm={onDelete}
      testId="bulk-delete-plans-modal"
      {...rest}
    >
      <Stack hasGutter>
        <StackItem>
          <ForkliftTrans>
            Are you sure you want to delete <strong>{plans.length}</strong> selected migration
            plans?
          </ForkliftTrans>
        </StackItem>
        {hasRunning && (
          <StackItem>
            <Alert
              variant={AlertVariant.danger}
              isInline
              title={t('Some selected plans are currently running')}
            />
          </StackItem>
        )}
        {hasUnarchived && (
          <StackItem>
            <Alert
              variant={AlertVariant.info}
              isInline
              title={t('Some selected plans are not archived')}
            >
              <ForkliftTrans>
                Deleting a migration plan does not remove temporary resources, it is recommended to{' '}
                <strong>archive</strong> the plan first before deleting it, to remove temporary
                resources.
              </ForkliftTrans>
            </Alert>
          </StackItem>
        )}
        {hasOwned && (
          <StackItem>
            <Alert
              variant={AlertVariant.warning}
              isInline
              title={t('Some selected plans are managed resources')}
            >
              <ForkliftTrans>
                Some selected plans are managed by other resources and any modifications might be
                overwritten. Edit the managing resource to preserve changes.
              </ForkliftTrans>
            </Alert>
          </StackItem>
        )}
        {ownedPlans.length > 0 &&
          ownedPlans.length <= MAX_PLANS_TO_LIST &&
          ownedPlans.map((plan) => {
            const owner = getOwnerReference(plan);
            if (!owner) {
              return null;
            }

            return (
              <StackItem key={getPlanRowId(plan)}>
                <ItemIsOwnedAlert owner={owner} namespace={getNamespace(plan)} />
              </StackItem>
            );
          })}
        {!isEmpty(plans) && plans.length <= MAX_PLANS_TO_LIST && (
          <StackItem>
            <List>
              {plans.map((plan) => (
                <ListItem key={getPlanRowId(plan)}>{getName(plan)}</ListItem>
              ))}
            </List>
          </StackItem>
        )}
      </Stack>
    </ModalForm>
  );
};

export default BulkDeletePlansModal;
