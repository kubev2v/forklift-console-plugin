import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HelperText, HelperTextItem, PageSection } from '@patternfly/react-core';

export const ConcernsTableEmptyState: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <PageSection hasBodyWrapper={false}>
      <HelperText>
        <HelperTextItem>{t('No concerns found for this virtual machine.')}</HelperTextItem>
      </HelperText>
    </PageSection>
  );
};
