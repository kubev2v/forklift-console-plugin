import type { FC } from 'react';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { Stack } from '@patternfly/react-core';
import { ForkliftTrans } from '@utils/i18n';
import { VIRT_V2V_HELP_LINK } from '@utils/links';

const EditRootDiskModalBody: FC = () => {
  return (
    <ForkliftTrans>
      <Stack hasGutter>
        <p>Choose the root filesystem to be converted.</p>
        <p>
          Default behavior is to choose the first root device in the case of a multi-boot operating
          system. Since this is a heuristic, it may sometimes choose the wrong one.
        </p>
        <p>
          When using a multi-boot VM, you can also name a specific root device, eg.{' '}
          <strong>/dev/sda2</strong> would mean to use the second partition on the first hard drive.
          If the named root device does not exist or was not detected as a root device, the
          migration will fail.{' '}
          <ExternalLink isInline href={VIRT_V2V_HELP_LINK}>
            Learn more
          </ExternalLink>
          .
        </p>
      </Stack>
    </ForkliftTrans>
  );
};

export default EditRootDiskModalBody;
