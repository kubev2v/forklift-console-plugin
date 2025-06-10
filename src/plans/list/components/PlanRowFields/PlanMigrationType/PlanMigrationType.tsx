import type { FC } from 'react';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import PlanCutoverMigrationModal from 'src/plans/actions/components/CutoverModal/PlanCutoverMigrationModal';
import {
  isPlanArchived,
  isPlanExecuting,
} from 'src/plans/details/components/PlanStatus/utils/utils';
import PlanWarmLabel from 'src/plans/details/components/PlanWarmLabel/PlanWarmLabel';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, ButtonVariant, Flex, FlexItem } from '@patternfly/react-core';
import { getPlanIsWarm } from '@utils/crds/plans/selectors';

import type { PlanFieldProps } from '../utils/types';

const PlanMigrationType: FC<PlanFieldProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const isWarm = getPlanIsWarm(plan);
  const canSetCutover = isWarm && isPlanExecuting(plan) && !isPlanArchived(plan);

  const onClickPlanCutoverMigration = () => {
    showModal(<PlanCutoverMigrationModal plan={plan} />);
  };

  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsMd' }}>
      <FlexItem>
        <PlanWarmLabel isWarm={isWarm} />
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
