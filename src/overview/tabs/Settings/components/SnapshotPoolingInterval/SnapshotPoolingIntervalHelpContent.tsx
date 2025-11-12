import type { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { MTV_SETTINGS } from '@utils/links';

const SnapshotPoolingIntervalHelpContent: FC = () => {
  const { t } = useForkliftTranslation();
  return (
    <Stack hasGutter>
      <StackItem>
        {t(
          'Determines the frequency with which the system checks the status of snapshot creation or removal during oVirt warm migration. The default value is 10 seconds.',
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

export default SnapshotPoolingIntervalHelpContent;
