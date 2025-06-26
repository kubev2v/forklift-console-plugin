import type { FC } from 'react';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import PlanCutoverMigrationModal from 'src/plans/actions/components/CutoverModal/PlanCutoverMigrationModal';
import PlanMigrationTypeLabel from 'src/plans/details/components/PlanMigrationTypeLabel/PlanMigrationTypeLabel';
import {
  isPlanArchived,
  isPlanExecuting,
} from 'src/plans/details/components/PlanStatus/utils/utils';
import { getPlanMigrationType } from 'src/plans/details/utils/utils.ts';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, ButtonVariant, Flex, FlexItem } from '@patternfly/react-core';
import { getPlanIsWarm } from '@utils/crds/plans/selectors';

import type { PlanFieldProps } from '../utils/types';

const PlanMigrationType: FC<PlanFieldProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const migrationType = getPlanMigrationType(plan);
  const canSetCutover = getPlanIsWarm(plan) && isPlanExecuting(plan) && !isPlanArchived(plan);

  const onClickPlanCutoverMigration = () => {
    showModal(<PlanCutoverMigrationModal plan={plan} />);
  };

  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsMd' }}>
      <FlexItem>
        <PlanMigrationTypeLabel migrationType={migrationType} />
      </FlexItem>

      {canSetCutover && (
        <FlexItem>
          <Button isInline variant={ButtonVariant.link} onClick={onClickPlanCutoverMigration}>
            {t('Cutover')}
          </Button>
        </FlexItem>
      )}
    </Flex>
  );
};

export default PlanMigrationType;
