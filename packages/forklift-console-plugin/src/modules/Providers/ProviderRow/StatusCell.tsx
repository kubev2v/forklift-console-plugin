import React from 'react';
import { StatusCell as Cell } from 'src/components/cells/StatusCell';
import { PHASE } from 'src/utils/constants';
import { useTranslation } from 'src/utils/i18n';

import { getResourceFieldValue } from '@kubev2v/common';

import { phaseLabels, statusIcons } from './consts';
import { CellProps } from './types';

export const StatusCell: React.FC<CellProps> = ({ resourceData, resourceFields }) => {
  const { t } = useTranslation();

  const phase = getResourceFieldValue(resourceData, PHASE, resourceFields);
  const phaseLabel = phaseLabels[phase] ? t(phaseLabels[phase]) : t('Undefined');
  return (
    <Cell
      conditions={resourceData?.status?.conditions}
      icon={statusIcons[phase]}
      label={phaseLabel}
    />
  );
};
