import type { FC } from 'react';
import PlanEditCutoverButton from 'src/plans/actions/PlanEditCutoverButton';
import PlanMigrationTypeLabel from 'src/plans/details/components/PlanMigrationTypeLabel/PlanMigrationTypeLabel';
import { getPlanMigrationType } from 'src/plans/details/utils/utils';

import { ButtonVariant, Flex, FlexItem } from '@patternfly/react-core';

import type { PlanFieldProps } from '../utils/types';

const PlanMigrationType: FC<PlanFieldProps> = ({ plan }) => {
  const migrationType = getPlanMigrationType(plan);

  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsMd' }}>
      <FlexItem>
        <PlanMigrationTypeLabel migrationType={migrationType} />
      </FlexItem>
      <FlexItem>
        <PlanEditCutoverButton plan={plan} variant={ButtonVariant.link} />
      </FlexItem>
    </Flex>
  );
};

export default PlanMigrationType;
