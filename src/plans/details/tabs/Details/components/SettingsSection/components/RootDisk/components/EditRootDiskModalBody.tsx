import type { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { ForkliftTrans } from '@utils/i18n';

const EditRootDiskModalBody: FC = () => {
  return (
    <ForkliftTrans>
      <Stack hasGutter>
        <StackItem>
          A root device is the storage device or partition that contains the root filesystem. For
          example, naming a root device "/dev/sda2" would mean to use the second partition on the
          first hard drive.
        </StackItem>

        <StackItem>
          If you do not provide a root device, the first root device will be used. If the named root
          device does not exist or is not detected as a root device, the migration will fail.
        </StackItem>
      </Stack>
    </ForkliftTrans>
  );
};

export default EditRootDiskModalBody;
