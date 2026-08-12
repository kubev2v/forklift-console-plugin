import type { FC } from 'react';
import { migrationStatusIconMap } from 'src/plans/details/components/PlanStatus/utils/statusIconMapper';
import { getMigrationVMStatus } from 'src/plans/details/components/PlanStatus/utils/utils';

import type { V1beta1PlanStatusMigrationVms } from '@forklift-ui/types';
import { Flex } from '@patternfly/react-core';

import { getVMMigrationStatus } from './utils/utils';

type MigrationStatusLabelProps = {
  statusVM: V1beta1PlanStatusMigrationVms | undefined;
};

const MigrationStatusLabel: FC<MigrationStatusLabelProps> = ({ statusVM }) => {
  const status = getMigrationVMStatus(statusVM);
  return (
    <Flex direction={{ default: 'row' }} gap={{ default: 'gapSm' }}>
      {status && migrationStatusIconMap[status]}
      {getVMMigrationStatus(statusVM)}
    </Flex>
  );
};

export default MigrationStatusLabel;
