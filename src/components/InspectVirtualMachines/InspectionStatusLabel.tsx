import type { FC } from 'react';

import { Label } from '@patternfly/react-core';
import type { InspectionStatus } from '@utils/crds/conversion/constants';
import { useForkliftTranslation } from '@utils/i18n';

import { getInspectionStatusConfig } from './utils/getInspectionStatusConfig';

type InspectionStatusLabelProps = {
  status: InspectionStatus;
  testId?: string;
};

const InspectionStatusLabel: FC<InspectionStatusLabelProps> = ({ status, testId }) => {
  const { t } = useForkliftTranslation();
  const config = getInspectionStatusConfig(status, t);

  return (
    <Label variant="filled" status={config.labelStatus} icon={config.icon} data-testid={testId}>
      {config.label}
    </Label>
  );
};

export default InspectionStatusLabel;
