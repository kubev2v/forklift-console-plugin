import { useCallback, useState } from 'react';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import { PlanModel, type V1beta1Plan } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import {
  Alert,
  AlertVariant,
  ButtonVariant,
  HelperText,
  HelperTextItem,
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
  type BulkPlanActionFailure,
  getBulkActionFailure,
  getPlanRowId,
  runSettledInBatches,
} from './utils';

export type BulkArchivePlansModalProps = {
  plans: V1beta1Plan[];
  skippedArchivedCount?: number;
};

const BulkArchivePlansModal: OverlayComponent<BulkArchivePlansModalProps> = ({
  closeOverlay,
  plans,
  skippedArchivedCount = 0,
  ...rest
}) => {
  const { t } = useForkliftTranslation();
  const [actionFailures, setActionFailures] = useState<BulkPlanActionFailure[]>([]);

  const onArchive = useCallback(async () => {
    setActionFailures([]);

    const results = await runSettledInBatches(plans, async (plan) =>
      k8sPatch({
        data: buildArchivePlanPatch(plan),
        model: PlanModel,
        resource: plan,
      }),
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
      confirmLabel={t('Archive')}
      confirmVariant={ButtonVariant.primary}
      isDisabled={isEmpty(plans)}
      onConfirm={onArchive}
      testId="bulk-archive-plans-modal"
      title={t('Archive migration plans')}
      {...rest}
    >
      <Stack hasGutter>
        <StackItem>
          <ForkliftTrans>
            Archive <strong>{plans.length}</strong> selected migration plans?
          </ForkliftTrans>
          <p>
            {t(
              'When a plan is archived, its history, metadata, and logs are deleted. The plan cannot be edited or restarted but it can be viewed.',
            )}
          </p>
          {skippedArchivedCount > 0 && (
            <HelperText>
              <HelperTextItem>
                {t('Some selected plans are already archived and will be skipped.')}
              </HelperTextItem>
            </HelperText>
          )}
        </StackItem>
        {!isEmpty(actionFailures) && (
          <StackItem>
            <Alert isInline title={t('Some plans failed to archive')} variant={AlertVariant.danger}>
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

export default BulkArchivePlansModal;
