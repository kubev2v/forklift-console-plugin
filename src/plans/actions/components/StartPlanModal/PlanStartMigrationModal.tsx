import { useCallback } from 'react';
import { canPlanStart } from 'src/plans/details/components/PlanStatus/utils/utils';
import usePlanSourceProvider from 'src/plans/details/hooks/usePlanSourceProvider';
import { getPlanMigrationType } from 'src/plans/details/utils/utils';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import type { V1beta1Plan } from '@kubev2v/types';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Stack, StackItem } from '@patternfly/react-core';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { getName } from '@utils/crds/common/selectors';

import { migrationModalMessage, startPlanMigration } from './utils/utils';

export type PlanStartMigrationModalProps = {
  plan: V1beta1Plan;
  title: string;
};

const PlanStartMigrationModal: ModalComponent<PlanStartMigrationModalProps> = ({
  plan,
  title,
  ...rest
}) => {
  const { t } = useForkliftTranslation();
  const { trackEvent } = useForkliftAnalytics();

  const name = getName(plan);
  const migrationType = getPlanMigrationType(plan);
  const { sourceProvider } = usePlanSourceProvider(plan);

  const onStart = useCallback(async () => {
    return startPlanMigration(plan, trackEvent, sourceProvider?.spec?.type);
  }, [plan, trackEvent, sourceProvider?.spec?.type]);

  const migrationMessage = migrationModalMessage(migrationType);

  return (
    <ModalForm
      title={t('{{title}} migration', { title })}
      onConfirm={onStart}
      confirmLabel={t('{{title}}', { title })}
      isDisabled={!canPlanStart(plan)}
      {...rest}
    >
      <Stack hasGutter>
        <StackItem>
          <ForkliftTrans>
            <StackItem>
              Start the {migrationType} migration for plan{' '}
              <strong className="co-break-word">{name}</strong>?
            </StackItem>
            <StackItem>{migrationMessage}</StackItem>
          </ForkliftTrans>
        </StackItem>
      </Stack>
    </ModalForm>
  );
};

export default PlanStartMigrationModal;
