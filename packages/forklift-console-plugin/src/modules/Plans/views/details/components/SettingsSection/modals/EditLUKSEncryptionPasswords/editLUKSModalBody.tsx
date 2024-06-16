import React from 'react';
import { ForkliftTrans } from 'src/utils';

import { ExternalLink } from '@kubev2v/common';

export const VIRT_V2V_HELP_LINK = 'https://libguestfs.org/virt-v2v.1.html';

export const editLUKSModalBody = (
  <>
    <ForkliftTrans>
      <p>
        Specify a list of passphrases for the Linux Unified Key Setup (LUKS)-encrypted devices for
        the VMs that you want to migrate.
      </p>
      <br />
      <p>
        For each LUKS-encrypted device, Migration Toolkit for Virtualization (MTV) tries each
        passphrase until one unlocks the device.{' '}
        <ExternalLink isInline href={VIRT_V2V_HELP_LINK}>
          Learn more
        </ExternalLink>
        .
      </p>
    </ForkliftTrans>
  </>
);
