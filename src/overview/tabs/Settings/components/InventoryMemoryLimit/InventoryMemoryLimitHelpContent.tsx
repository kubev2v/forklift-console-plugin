import type { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { MTV_SETTINGS } from '@utils/links';

const InventoryMemoryLimitHelpContent: FC = () => {
  const { t } = useForkliftTranslation();
  return (
    <Stack hasGutter>
      <StackItem>
        {t(
          'Sets the memory limits allocated to the inventory container in the controller pod. The default value is 1000Mi.',
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

export default InventoryMemoryLimitHelpContent;
