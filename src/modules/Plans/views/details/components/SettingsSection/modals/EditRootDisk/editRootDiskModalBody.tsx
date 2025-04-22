import { ExternalLink } from 'src/components/common/ExternalLink/ExternalLink';
import { ForkliftTrans } from 'src/utils/i18n';

import { VIRT_V2V_HELP_LINK } from '../EditLUKSEncryptionPasswords/editLUKSModalBody';

export const editRootDiskModalBody = (
  <>
    <ForkliftTrans>
      <p>Choose the root filesystem to be converted.</p>
      <br />
      <p>
        Default behavior is to choose the first root device in the case of a multi-boot operating
        system. Since this is a heuristic, it may sometimes choose the wrong one.
      </p>
      <br />
      <p>
        When using a multi-boot VM, you can also name a specific root device, eg.{' '}
        <strong>/dev/sda2</strong> would mean to use the second partition on the first hard drive.
        If the named root device does not exist or was not detected as a root device, the migration
        will fail.{' '}
        <ExternalLink isInline href={VIRT_V2V_HELP_LINK}>
          Learn more
        </ExternalLink>
        .
      </p>
    </ForkliftTrans>
  </>
);
