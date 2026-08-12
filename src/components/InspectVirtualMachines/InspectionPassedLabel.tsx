import type { FC } from 'react';

import { Icon, Label } from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
import { PF_LABEL_STATUS } from '@utils/constants';
import { useForkliftTranslation } from '@utils/i18n';

type InspectionPassedLabelProps = {
  passed: boolean;
};

const InspectionPassedLabel: FC<InspectionPassedLabelProps> = ({ passed }) => {
  const { t } = useForkliftTranslation();

  if (passed) {
    return (
      <Label
        icon={
          <Icon isInline>
            <CheckCircleIcon />
          </Icon>
        }
        status={PF_LABEL_STATUS.SUCCESS}
        variant="filled"
      >
        {t('Inspection passed')}
      </Label>
    );
  }

  return (
    <Label
      icon={
        <Icon isInline>
          <ExclamationTriangleIcon />
        </Icon>
      }
      status={PF_LABEL_STATUS.WARNING}
      variant="filled"
    >
      {t('Issues found')}
    </Label>
  );
};

export default InspectionPassedLabel;
