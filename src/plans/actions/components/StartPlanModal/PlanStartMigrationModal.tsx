import { type FC, useCallback } from 'react';
import { usePlanMigration } from 'src/plans/hooks/usePlanMigration';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import type { V1beta1Plan } from '@kubev2v/types';
import { Stack, StackItem } from '@patternfly/react-core';
import { getName } from '@utils/crds/common/selectors';
import { getPlanIsWarm } from '@utils/crds/plans/selectors';

import { startPlanMigration } from './utils/utils';

type PlanStartMigrationModalProps = {
  plan: V1beta1Plan;
  title: string;
};

const PlanStartMigrationModal: FC<PlanStartMigrationModalProps> = ({ plan, title }) => {
  const { t } = useForkliftTranslation();
  const [lastMigration] = usePlanMigration(plan);

  const isRunningMigrationExist =
    lastMigration !== undefined && lastMigration?.status?.completed === undefined;
  const name = getName(plan);
  const warm = getPlanIsWarm(plan);

  const onStart = useCallback(async () => {
    return startPlanMigration(plan);
  }, [plan]);

  return (
    <ModalForm
      title={t('{{title}} migration', { title })}
      onConfirm={onStart}
      confirmLabel={t('{{title}}', { title })}
      isDisabled={isRunningMigrationExist}
    >
      <Stack hasGutter>
        <StackItem>
          <ForkliftTrans>
            <StackItem>
              Start the {warm ? 'warm' : 'cold'} migration for plan{' '}
              <strong className="co-break-word">{name}</strong>?
            </StackItem>
            <StackItem>
              VMs included in {warm ? 'warm' : 'cold'}{' '}
              {warm ? 'migrations migrate with minimal downtime' : 'are shut down during migration'}
              .
            </StackItem>
          </ForkliftTrans>
        </StackItem>
      </Stack>
    </ModalForm>
  );
};

export default PlanStartMigrationModal;
