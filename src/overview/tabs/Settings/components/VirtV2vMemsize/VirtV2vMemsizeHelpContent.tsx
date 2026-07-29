import type { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

const VirtV2vMemsizeHelpContent: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        {t(
          'Sets the amount of memory (in MB) allocated to the libguestfs appliance used by virt-v2v during conversion. This is a cluster-wide setting that applies to all migrations.',
        )}
      </StackItem>
      <StackItem>
        {t(
          'A value of 0 means virt-v2v chooses automatically. Only change this if conversions fail due to insufficient appliance memory (e.g. 4096 for 4 GB).',
        )}
      </StackItem>
    </Stack>
  );
};

export default VirtV2vMemsizeHelpContent;
