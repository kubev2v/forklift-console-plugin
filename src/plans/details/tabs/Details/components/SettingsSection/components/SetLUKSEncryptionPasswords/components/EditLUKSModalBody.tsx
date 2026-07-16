import type { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { ForkliftTrans } from '@utils/i18n';

const EditLUKSModalBody: FC = () => (
  <>
    <ForkliftTrans>
      <Stack hasGutter>
        <StackItem>
          Configure disk decryption for LUKS-encrypted devices. You can use network-bound decryption
          (NBDE/Clevis) for automatic unlocking via Tang servers, select a pre-existing secret, or
          provide manual passphrases. These settings apply to all VMs in the migration plan.
        </StackItem>

        <StackItem>
          For manual passphrases, migration toolkit for virtualization (MTV) tries each passphrase
          until one unlocks the device.
        </StackItem>
      </Stack>
    </ForkliftTrans>
  </>
);

export default EditLUKSModalBody;
