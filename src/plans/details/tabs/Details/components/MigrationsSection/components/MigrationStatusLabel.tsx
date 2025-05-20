import type { FC } from 'react';
import { migrationStatusIconMap } from 'src/plans/details/components/PlanStatus/utils/statusIconMapper';
import { getVMStatusIcon } from 'src/plans/details/components/PlanStatus/utils/utils';

import type { V1beta1PlanStatusMigrationVms } from '@kubev2v/types';
import { Flex } from '@patternfly/react-core';

type MigrationStatusLabelProps = {
  statusVM: V1beta1PlanStatusMigrationVms | undefined;
};

const MigrationStatusLabel: FC<MigrationStatusLabelProps> = ({ statusVM }) => {
  const status = getVMStatusIcon(statusVM);
  return (
    <Flex gap={{ default: 'gapSm' }} direction={{ default: 'row' }}>
      {migrationStatusIconMap[status!]}
      {status}
    </Flex>
  );
};

export default MigrationStatusLabel;
