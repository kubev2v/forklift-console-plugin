import { useCallback, useState } from 'react';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import { PlanModel, type V1beta1Plan } from '@forklift-ui/types';
import { k8sDelete } from '@openshift-console/dynamic-plugin-sdk';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import {
  Alert,
  AlertVariant,
  ButtonVariant,
  List,
  ListItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { getName } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

import { MAX_PLANS_TO_LIST } from './constants';
import {
  type BulkPlanActionFailure,
  getBulkActionFailure,
  getOwnedPlans,
  getPlanRowId,
  hasNonArchivedSelectedPlans,
  runSettledInBatches,
} from './utils';

export type BulkDeletePlansModalProps = {
  plans: V1beta1Plan[];
};

const BulkDeletePlansModal: OverlayComponent<BulkDeletePlansModalProps> = ({
  closeOverlay,
  plans,
}) => {
  const { t } = useForkliftTranslation();
  const [actionFailures, setActionFailures] = useState<BulkPlanActionFailure[]>([]);

  const hasNonArchived = hasNonArchivedSelectedPlans(plans);
  const ownedPlans = getOwnedPlans(plans);

  const onDelete = useCallback(async () => {
    setActionFailures([]);

    const results = await runSettledInBatches(plans, async (plan) =>
      k8sDelete({ model: PlanModel, resource: plan }),
    );

    const failures = results.flatMap((result, index) => {
      if (result.status === 'fulfilled') {
        return [];
      }

      return [getBulkActionFailure(plans[index], result.reason)];
    });

    if (!isEmpty(failures)) {
      setActionFailures(failures);
      throw new Error('');
    }
  }, [plans]);

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      confirmLabel={t('Delete')}
      confirmVariant={ButtonVariant.danger}
      isDisabled={isEmpty(plans)}
      onConfirm={onDelete}
      testId="bulk-delete-plans-modal"
      title={t('Delete migration plans')}
    >
      <Stack hasGutter>
        <StackItem>
          <ForkliftTrans>
            Are you sure you want to delete <strong>{plans.length}</strong> selected migration
            plans?
          </ForkliftTrans>
        </StackItem>
        {hasNonArchived && (
          <StackItem>
            <Alert
              isInline
              title={t('Some selected plans are not archived')}
              variant={AlertVariant.info}
            >
              <ForkliftTrans>
                Deleting a migration plan does not remove temporary resources, it is recommended to{' '}
                <strong>archive</strong> the plan first before deleting it, to remove temporary
                resources.
              </ForkliftTrans>
            </Alert>
          </StackItem>
        )}
        {!isEmpty(ownedPlans) && (
          <StackItem>
            <Alert
              isInline
              title={t('Some selected plans are managed resources')}
              variant={AlertVariant.warning}
            >
              {t(
                'Some selected plans are managed by other resources and any modifications might be overwritten. Edit the managing resource to preserve changes.',
              )}
            </Alert>
          </StackItem>
        )}
        {!isEmpty(actionFailures) && (
          <StackItem>
            <Alert isInline title={t('Some plans failed to delete')} variant={AlertVariant.danger}>
              <List>
                {actionFailures.map((failure) => (
                  <ListItem key={failure.name}>
                    {t('{{name}}: {{message}}', {
                      message: failure.message,
                      name: failure.name,
                    })}
                  </ListItem>
                ))}
              </List>
            </Alert>
          </StackItem>
        )}
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
