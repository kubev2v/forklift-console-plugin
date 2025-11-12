import type { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { MTV_SETTINGS } from '@utils/links';

const ControllerCPULimitHelpContent: FC = () => {
  const { t } = useForkliftTranslation();
  return (
    <Stack hasGutter>
      <StackItem>
        {t(
          'Defines the CPU limits allocated to the main container in the controller pod. The default value is 500 milliCPU.',
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

export default ControllerCPULimitHelpContent;
