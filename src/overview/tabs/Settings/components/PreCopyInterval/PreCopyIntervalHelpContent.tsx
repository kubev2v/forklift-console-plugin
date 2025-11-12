import type { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { MTV_SETTINGS } from '@utils/links';

const PreCopyIntervalHelpContent: FC = () => {
  const { t } = useForkliftTranslation();
  return (
    <Stack hasGutter>
      <StackItem>
        {t(
          'Controls the interval at which a new snapshot is requested prior to initiating a warm migration. The default value is 60 minutes.',
        )}
      </StackItem>
      <StackItem>
        <a href={MTV_SETTINGS} target="_blank" rel="noreferrer">
          Learn more
        </a>
      </StackItem>
    </Stack>
  );
};

export default PreCopyIntervalHelpContent;
