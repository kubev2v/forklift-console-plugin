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
          Configure disk decryption for LUKS-encrypted devices. You can use network-bound decryption
          (NBDE/Clevis) for automatic unlocking via Tang servers, or provide manual passphrases.
          These settings apply to all VMs in the migration plan.
        </StackItem>

        <StackItem>
          For manual passphrases, Migration Toolkit for Virtualization (MTV) tries each passphrase
          until one unlocks the device.{' '}
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
