import type { FC } from 'react';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { Stack, StackItem } from '@patternfly/react-core';
import { ForkliftTrans } from '@utils/i18n';
import { VIRT_V2V_HELP_LINK } from '@utils/links';

const EditLUKSModalBody: FC = () => (
  <>
    <ForkliftTrans>
      <Stack hasGutter>
        <StackItem>
          Specify a list of passphrases for the Linux Unified Key Setup (LUKS)-encrypted devices for
          the VMs that you want to migrate.
        </StackItem>

        <StackItem>
          For each LUKS-encrypted device, Migration Toolkit for Virtualization (MTV) tries each
          passphrase until one unlocks the device.{' '}
          <ExternalLink isInline href={VIRT_V2V_HELP_LINK}>
            Learn more
          </ExternalLink>
          .
        </StackItem>
      </Stack>
    </ForkliftTrans>
  </>
);

export default EditLUKSModalBody;
