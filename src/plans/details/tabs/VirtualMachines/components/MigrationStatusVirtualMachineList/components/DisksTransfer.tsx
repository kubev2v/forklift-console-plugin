import type { FC } from 'react';

import type { V1beta1PlanStatusMigrationVmsPipeline } from '@forklift-ui/types';
import { EMPTY_MSG } from '@utils/constants';

import { getTransferProgress } from './utils/utils';

type DisksTransferProps = {
  diskTransferPipeline: V1beta1PlanStatusMigrationVmsPipeline | undefined;
};

const DisksTransfer: FC<DisksTransferProps> = ({ diskTransferPipeline }) => {
  const annotations = diskTransferPipeline?.annotations ?? {};
  const { completed, total } = getTransferProgress(diskTransferPipeline);

  if (!diskTransferPipeline || !annotations?.unit) return <>{EMPTY_MSG}</>;

  return (
    <>
      {completed} / {total} {annotations?.unit ?? EMPTY_MSG}
    </>
  );
};

export default DisksTransfer;
