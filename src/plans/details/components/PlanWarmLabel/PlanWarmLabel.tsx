import type { FC } from 'react';

import { Button, ButtonVariant, Label, Popover } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import './PlanWarmLabel.scss';

type PlanWarmLabelProps = {
  isWarm?: boolean;
};

const PlanWarmLabel: FC<PlanWarmLabelProps> = ({ isWarm }) => {
  const { t } = useForkliftTranslation();
  return (
    <Popover
      headerContent={t('{{type}} migration', { type: isWarm ? 'Warm' : 'Cold' })}
      bodyContent={
        isWarm
          ? t(
              'With a warm migration, we will move an active virtual machine between hosts with minimal downtime. This is not a live migration.',
            )
          : t('With a cold migration, we will move the shut down VM between hosts.')
      }
    >
      <Button className="forklift-plan-warm-label" variant={ButtonVariant.plain} isInline>
        <Label isCompact color={isWarm ? 'orange' : 'blue'}>
          {isWarm ? t('Warm') : t('Cold')}
        </Label>
      </Button>
    </Popover>
  );
};

export default PlanWarmLabel;
