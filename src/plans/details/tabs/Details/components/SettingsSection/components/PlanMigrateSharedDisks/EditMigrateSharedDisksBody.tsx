import type { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { ForkliftTrans } from '@utils/i18n';

const EditMigrateSharedDisksBody: FC = () => {
  return (
    <ForkliftTrans>
      <Stack hasGutter>
        <StackItem>
          MTV behavior is based on the <strong>Shared disks</strong> setting in the plan.
        </StackItem>
        <StackItem>
          If this is set to <strong>true</strong>, the shared disks will be migrated.
        </StackItem>
        <StackItem>
          If this is set to <strong>false</strong>, the shared disks will not be migrated.
        </StackItem>
      </Stack>
    </ForkliftTrans>
  );
};

export default EditMigrateSharedDisksBody;
