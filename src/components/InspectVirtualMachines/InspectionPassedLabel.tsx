import type { FC } from 'react';

import { Icon, Label } from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

type InspectionPassedLabelProps = {
  passed: boolean;
};

const InspectionPassedLabel: FC<InspectionPassedLabelProps> = ({ passed }) => {
  const { t } = useForkliftTranslation();

  if (passed) {
    return (
      <Label
        variant="filled"
        status="success"
        icon={
          <Icon isInline>
            <CheckCircleIcon />
          </Icon>
        }
      >
        {t('Inspection passed')}
      </Label>
    );
  }

  return (
    <Label
      variant="filled"
      status="warning"
      icon={
        <Icon isInline>
          <ExclamationTriangleIcon />
        </Icon>
      }
    >
      {t('Issues found')}
    </Label>
  );
};

export default InspectionPassedLabel;
