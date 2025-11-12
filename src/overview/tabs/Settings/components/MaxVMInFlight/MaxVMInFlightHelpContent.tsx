import type { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { ForkliftTrans } from '@utils/i18n';
import { MAX_CONCURRENT_VIRTUAL_MACHINE_MIGRATIONS } from '@utils/links';

const MaxVMInFlightHelpContent: FC = () => (
  <ForkliftTrans>
    <Stack hasGutter>
      <StackItem>
        Sets the maximum number of virtual machines or disks that can be migrated simultaneously,
        varies by the source provider type and by the settings of the migration.
      </StackItem>
      <StackItem>The default value is 20 virtual machines or disks.</StackItem>
      <StackItem>
        <a href={MAX_CONCURRENT_VIRTUAL_MACHINE_MIGRATIONS} target="_blank" rel="noreferrer">
          Learn more
        </a>
      </StackItem>
    </Stack>
  </ForkliftTrans>
);

export default MaxVMInFlightHelpContent;
