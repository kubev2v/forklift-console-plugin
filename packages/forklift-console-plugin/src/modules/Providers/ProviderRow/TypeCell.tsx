import React from 'react';
import * as C from 'src/utils/constants';
import { PROVIDERS } from 'src/utils/enums';
import { useForkliftTranslation } from 'src/utils/i18n';

import { getResourceFieldValue } from '@kubev2v/common';
import { TARGET_PROVIDER_TYPES } from '@kubev2v/legacy/common/constants';
import { Label } from '@patternfly/react-core';

import { CellProps } from './types';

export const TypeCell: React.FC<CellProps> = ({ resourceData, resourceFields }) => {
  const { t } = useForkliftTranslation();
  const type = getResourceFieldValue(resourceData, C.TYPE, resourceFields);
  const isTarget = TARGET_PROVIDER_TYPES.includes(type);

  return (
    <span className="forklift-table__flex-cell">
      {PROVIDERS?.[type] || ''}
      {isTarget ? (
        <Label isCompact color="blue" className="forklift-table__flex-cell-label">
          {t('target').toLowerCase()}
        </Label>
      ) : (
        <Label isCompact color="green" className="forklift-table__flex-cell-label">
          {t('source').toLowerCase()}
        </Label>
      )}
    </span>
  );
};
