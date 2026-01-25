import type { FC } from 'react';

import type { V1beta1PlanStatusMigrationVmsPipeline } from '@forklift-ui/types';
import { EMPTY_MSG } from '@utils/constants';

import { countTasks } from './utils/utils';

type DisksCounterProps = {
  diskTransferPipeline: V1beta1PlanStatusMigrationVmsPipeline | undefined;
};

const DisksCounter: FC<DisksCounterProps> = ({ diskTransferPipeline }) => {
  const { completedTasks, totalTasks } = countTasks(diskTransferPipeline);

  if (!diskTransferPipeline || !totalTasks) return <>{EMPTY_MSG}</>;

  return (
    <>
      {completedTasks ?? EMPTY_MSG} / {totalTasks ?? EMPTY_MSG} Disks
    </>
  );
};

export default DisksCounter;
