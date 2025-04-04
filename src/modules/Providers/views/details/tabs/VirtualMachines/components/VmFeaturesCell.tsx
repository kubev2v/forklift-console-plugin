import * as React from 'react';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Label } from '@patternfly/react-core';

import { getOpenShiftFeatureMap } from '../utils/helpers/getOpenShiftFeatureMap';
import { toVmFeatureEnum } from '../utils/helpers/toVmFeatureEnum';

import type { VMCellProps } from './VMCellProps';

export const VmFeaturesCell: React.FC<VMCellProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const featureToLabel = toVmFeatureEnum(t);
  return (
    <TableCell>
      {Object.entries(getOpenShiftFeatureMap(data?.vm))
        .filter(([, value]) => value)
        .map(([key]) => (
          <Label key={key} isCompact>
            {featureToLabel[key]}
          </Label>
        ))}
    </TableCell>
  );
};
