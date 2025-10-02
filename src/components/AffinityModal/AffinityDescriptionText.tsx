import type { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { AFFINITY_MODAL_DESCRIPTION } from './utils/constants';

const AffinityDescriptionText: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <Stack hasGutter>
        <StackItem className="text-muted">{AFFINITY_MODAL_DESCRIPTION}</StackItem>

        <StackItem className="text-muted">
          {t('Rules with "Preferred" condition will stack with an "AND" relation between them.')}
        </StackItem>
        <StackItem className="text-muted">
          {t('Rules with "Required" condition will stack with an "OR" relation between them.')}
        </StackItem>
      </Stack>
    </>
  );
};
export default AffinityDescriptionText;
