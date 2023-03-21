import React from 'react';
import { PHASE } from 'src/utils/constants';
import { useTranslation } from 'src/utils/i18n';

import { getResourceFieldValue } from '@kubev2v/common/components/Filter';

import { StatusCell as Cell } from '../../../components/cells/StatusCell';

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
