import type { FC } from 'react';

import type { Concern, V1beta1PlanStatusConditions } from '@kubev2v/types';
import { Button, ButtonVariant, Label, Popover } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { getCategoryStatus, getCategoryTitle } from '../utils/category';

import ConcernList from './ConcernsList';

const ConcernPopover: FC<{
  category: string;
  concerns: Concern[];
  conditions: V1beta1PlanStatusConditions[];
}> = ({ category, concerns, conditions }) => {
  const { t } = useForkliftTranslation();

  if (isEmpty(concerns) && isEmpty(conditions)) return null;

  const totalLength = concerns.length + conditions.length;

  return (
    <Popover
      aria-label={`${category} popover`}
      headerContent={getCategoryTitle(category)}
      bodyContent={<ConcernList concerns={concerns} conditions={conditions} />}
      footerContent={t('Total: {{length}}', { length: totalLength })}
      data-testid="concerns-popover"
    >
      <Button isInline variant={ButtonVariant.link}>
        <Label status={getCategoryStatus(category)}>{totalLength}</Label>
      </Button>
    </Popover>
  );
};

export default ConcernPopover;
