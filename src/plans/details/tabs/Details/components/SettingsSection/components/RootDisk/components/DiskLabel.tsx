import type { FC } from 'react';

import { Icon, Label, Tooltip } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

import { getRootDiskLabelByKey, isNotFirstKeyOrRootFilesystem } from '../utils/utils';

type DiskLabelProps = {
  diskKey: string | undefined;
};

const DiskLabel: FC<DiskLabelProps> = ({ diskKey }) => {
  const { t } = useForkliftTranslation();
  const diskLabel = getRootDiskLabelByKey(diskKey);

  return (
    <Label
      isCompact
      color="grey"
      icon={
        isNotFirstKeyOrRootFilesystem(diskKey) && (
          <Tooltip
            content={t(
              'Root filesystem format should start with "/dev/sd[X]", see documentation for more information.',
            )}
          >
            <Icon className="pf-v6-u-mr-xs">
              <ExclamationTriangleIcon color="#F0AB00" />
            </Icon>
          </Tooltip>
        )
      }
    >
      {diskLabel}
    </Label>
  );
};

export default DiskLabel;
