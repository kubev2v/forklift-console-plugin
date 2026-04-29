import type { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

const AapTimeoutHelpContent: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        {t(
          'Global timeout (in seconds) for AAP job template execution. When set, this value is used for all AAP hooks unless overridden per hook.',
        )}
      </StackItem>
      <StackItem>{t('A value of 0 means use backend defaults.')}</StackItem>
    </Stack>
  );
};

export default AapTimeoutHelpContent;
