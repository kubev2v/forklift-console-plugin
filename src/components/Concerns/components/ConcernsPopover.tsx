import type { FC } from 'react';

import type { Concern } from '@kubev2v/types';
import { Button, ButtonVariant, Label, Popover } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { getCategoryColor, getCategoryIcon, getCategoryTitle } from '../utils/category';

import ConcernList from './ConcernsList';

const ConcernPopover: FC<{
  category: string;
  concerns: Concern[];
}> = ({ category, concerns }) => {
  const { t } = useForkliftTranslation();

  if (isEmpty(concerns)) return null;

  return (
    <Popover
      aria-label={`${category} popover`}
      headerContent={getCategoryTitle(category)}
      bodyContent={<ConcernList concerns={concerns} />}
      footerContent={t('Total: {{length}}', { length: concerns.length })}
    >
      <Button isInline variant={ButtonVariant.link}>
        <Label color={getCategoryColor(category)} icon={getCategoryIcon(category)}>
          {concerns.length}
        </Label>
      </Button>
    </Popover>
  );
};

export default ConcernPopover;
