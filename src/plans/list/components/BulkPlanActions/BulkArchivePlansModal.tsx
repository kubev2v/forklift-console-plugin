import { useCallback, useMemo } from 'react';
import { PlanStatuses } from 'src/plans/details/components/PlanStatus/utils/types';
import { getPlanStatus } from 'src/plans/details/components/PlanStatus/utils/utils';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import { PlanModel, type V1beta1Plan } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
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
import { getName } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

import { MAX_PLANS_TO_LIST } from './constants';
import {
  buildArchivePlanPatch,
  getPlanRowId,
  getPlansEligibleForArchive,
  hasRunningSelectedPlans,
  runSettledInBatches,
} from './utils';

export type BulkArchivePlansModalProps = {
  plans: V1beta1Plan[];
  onComplete?: () => void;
};

const BulkArchivePlansModal: ModalComponent<BulkArchivePlansModalProps> = ({
  onComplete,
  plans,
  ...rest
}) => {
  const { t } = useForkliftTranslation();

  const eligiblePlans = useMemo(() => getPlansEligibleForArchive(plans), [plans]);
  const skippedCount = plans.length - eligiblePlans.length;
  const hasRunning = hasRunningSelectedPlans(eligiblePlans);

  const onArchive = useCallback(async () => {
    if (isEmpty(eligiblePlans)) {
      throw new Error(t('No selected plans are eligible for archive.'));
    }

    const results = await runSettledInBatches(eligiblePlans, async (plan) =>
      k8sPatch({
        data: buildArchivePlanPatch(plan),
        model: PlanModel,
        resource: plan,
      }),
    );

    const failed = results.filter((result) => result.status === 'rejected');
    if (!isEmpty(failed)) {
      throw new Error(
        t('Failed to archive {{count}} of {{total}} selected plans.', {
          count: failed.length,
          total: eligiblePlans.length,
        }),
      );
    }

    onComplete?.();
  }, [eligiblePlans, onComplete, t]);

  return (
    <ModalForm
      confirmLabel={t('Archive')}
      confirmVariant={hasRunning ? ButtonVariant.danger : ButtonVariant.primary}
      isDisabled={isEmpty(eligiblePlans)}
      title={t('Archive migration plans')}
      onConfirm={onArchive}
      testId="bulk-archive-plans-modal"
      {...rest}
    >
      <Stack hasGutter>
        <StackItem>
          <ForkliftTrans>
            Archive <strong>{eligiblePlans.length}</strong> selected migration plans?
          </ForkliftTrans>
        </StackItem>
        <StackItem>
          {t(
            'When a plan is archived, its history, metadata, and logs are deleted. The plan cannot be edited or restarted but it can be viewed.',
          )}
        </StackItem>
        {skippedCount > 0 && (
          <StackItem>
            <Alert variant={AlertVariant.info} isInline title={t('Some plans will be skipped')}>
              {t('{{count}} selected plans are already archived and will not be changed.', {
                count: skippedCount,
              })}
            </Alert>
          </StackItem>
        )}
        {hasRunning && (
          <StackItem>
            <Alert
              variant={AlertVariant.warning}
              isInline
              title={t('Some selected plans are currently running')}
            />
          </StackItem>
        )}
        {!isEmpty(eligiblePlans) && eligiblePlans.length <= MAX_PLANS_TO_LIST && (
          <StackItem>
            <List>
              {eligiblePlans.map((plan) => {
                const status = getPlanStatus(plan);
                const isRunning =
                  status === PlanStatuses.Executing || status === PlanStatuses.Pending;

                return (
                  <ListItem key={getPlanRowId(plan)}>
                    {getName(plan)}
                    {isRunning ? ` (${t('Running')})` : ''}
                  </ListItem>
                );
              })}
            </List>
          </StackItem>
        )}
      </Stack>
    </ModalForm>
  );
};

export default BulkArchivePlansModal;
