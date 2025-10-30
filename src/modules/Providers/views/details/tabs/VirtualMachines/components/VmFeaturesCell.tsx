import type { FC } from 'react';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';

import { Label } from '@patternfly/react-core';
import type { VmFeatures } from '@utils/types';

import { getOpenShiftFeatureMap } from '../utils/helpers/getOpenShiftFeatureMap';
import { toVmFeatureEnum } from '../utils/helpers/toVmFeatureEnum';

import type { VMCellProps } from './VMCellProps';

export const VmFeaturesCell: FC<VMCellProps> = ({ data }) => {
  const featureToLabel = toVmFeatureEnum();
  return (
    <TableCell>
      {Object.entries(getOpenShiftFeatureMap(data?.vm))
        .filter(([, value]) => value)
        .map(([key]) => (
          <Label key={key} isCompact>
            {featureToLabel[key as keyof VmFeatures]}
          </Label>
        ))}
    </TableCell>
  );
};
