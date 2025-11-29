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

  return (
    <Popover
      aria-label={`${category} popover`}
      headerContent={getCategoryTitle(category)}
      bodyContent={<ConcernList concerns={concerns} conditions={conditions} />}
      footerContent={t('Total: {{length}}', { length: concerns.length + conditions.length })}
      data-testid="concerns-popover"
    >
      <Button isInline variant={ButtonVariant.link}>
        <Label status={getCategoryStatus(category)}>{concerns.length + conditions.length}</Label>
      </Button>
    </Popover>
  );
};

export default ConcernPopover;
