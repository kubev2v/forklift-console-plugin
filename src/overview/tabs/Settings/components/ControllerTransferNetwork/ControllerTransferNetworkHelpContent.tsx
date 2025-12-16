import type { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { MTV_SETTINGS } from '@utils/links';

const ControllerTransferNetworkHelpContent: FC = () => {
  const { t } = useForkliftTranslation();
  return (
    <Stack hasGutter>
      <StackItem>
        {t(
          'Choose a NetworkAttachmentDefinition for data transfer by the main controller pod. If you do not select a NetworkAttachmentDefinition, the default network will be used.',
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

export default ControllerTransferNetworkHelpContent;
