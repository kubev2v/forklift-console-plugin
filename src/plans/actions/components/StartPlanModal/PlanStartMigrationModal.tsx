import { type FC, useCallback } from 'react';
import { canPlanStart } from 'src/plans/details/components/PlanStatus/utils/utils';
import { getPlanMigrationType } from 'src/plans/details/utils/utils';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import type { V1beta1Plan } from '@kubev2v/types';
import { Stack, StackItem } from '@patternfly/react-core';
import { getName } from '@utils/crds/common/selectors';

import { migrationModalMessage, startPlanMigration } from './utils/utils';

type PlanStartMigrationModalProps = {
  plan: V1beta1Plan;
  title: string;
};

const PlanStartMigrationModal: FC<PlanStartMigrationModalProps> = ({ plan, title }) => {
  const { t } = useForkliftTranslation();

  const name = getName(plan);
  const migrationType = getPlanMigrationType(plan);

  const onStart = useCallback(async () => {
    return startPlanMigration(plan);
  }, [plan]);

  const migrationMessage = migrationModalMessage(migrationType);

  return (
    <ModalForm
      title={t('{{title}} migration', { title })}
      onConfirm={onStart}
      confirmLabel={t('{{title}}', { title })}
      isDisabled={!canPlanStart(plan)}
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
