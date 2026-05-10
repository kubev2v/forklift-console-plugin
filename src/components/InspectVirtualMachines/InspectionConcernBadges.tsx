import type { FC } from 'react';

import { getCategoryStatus } from '@components/Concerns/utils/category';
import {
  Button,
  ButtonVariant,
  Label,
  Popover,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import type { InspectionConcern } from '@utils/crds/conversion/types';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import {
  groupInspectionConcernsByCategory,
  ORDERED_INSPECTION_CONCERN_CATEGORIES,
} from './utils/groupInspectionConcerns';

type InspectionConcernBadgesProps = {
  concerns: InspectionConcern[];
};

const InspectionConcernBadges: FC<InspectionConcernBadgesProps> = ({ concerns }) => {
  const { t } = useForkliftTranslation();
  const grouped = groupInspectionConcernsByCategory(concerns);

  return (
    <Split hasGutter>
      {ORDERED_INSPECTION_CONCERN_CATEGORIES.map((category) => {
        const items = grouped.get(category) ?? [];
        if (isEmpty(items)) return null;

        return (
          <SplitItem key={category}>
            <Popover
              aria-label={`${category} inspection concerns`}
              headerContent={t('{{category}} inspection concerns', { category })}
              bodyContent={
                <Stack>
                  {items.map((concern) => (
                    <StackItem key={concern.id}>{concern.label}</StackItem>
                  ))}
                </Stack>
              }
              footerContent={t('Total: {{length}}', { length: items.length })}
            >
              <Button isInline variant={ButtonVariant.link}>
                <Label status={getCategoryStatus(category)}>{items.length}</Label>
              </Button>
            </Popover>
          </SplitItem>
        );
      })}
    </Split>
  );
};

export default InspectionConcernBadges;
