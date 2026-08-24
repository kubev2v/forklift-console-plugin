import type { FC } from 'react';

import type { V1beta1PlanStatusMigrationVmsPipeline } from '@forklift-ui/types';
import { EMPTY_MSG } from '@utils/constants';
import { useForkliftTranslation } from '@utils/i18n';

import { countTasks } from './utils/utils';

type DisksCounterProps = {
  diskTransferPipeline: V1beta1PlanStatusMigrationVmsPipeline | undefined;
};

const DisksCounter: FC<DisksCounterProps> = ({ diskTransferPipeline }) => {
  const { t } = useForkliftTranslation();
  const { completedTasks, totalTasks } = countTasks(diskTransferPipeline);

  if (!diskTransferPipeline || !totalTasks) {
    return <>{EMPTY_MSG}</>;
  }

  return (
    <>
      {t('{{completed}} / {{total}} Disks', {
        completed: completedTasks ?? EMPTY_MSG,
        total: totalTasks ?? EMPTY_MSG,
      })}
    </>
  );
};

export default DisksCounter;
