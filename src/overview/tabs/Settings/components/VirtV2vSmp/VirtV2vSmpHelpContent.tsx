import type { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

const VirtV2vSmpHelpContent: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        {t(
          'Sets the number of virtual CPUs allocated to the libguestfs appliance used by virt-v2v during conversion. This is a cluster-wide setting that applies to all migrations.',
        )}
      </StackItem>
      <StackItem>
        {t(
          'A value of 0 means virt-v2v chooses automatically. Only change this if conversions are slow or fail due to insufficient appliance CPUs (e.g. 8 for 8 vCPUs).',
        )}
      </StackItem>
    </Stack>
  );
};

export default VirtV2vSmpHelpContent;
