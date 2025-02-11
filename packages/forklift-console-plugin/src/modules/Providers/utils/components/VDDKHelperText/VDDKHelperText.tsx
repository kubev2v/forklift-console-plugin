import React from 'react';
import { ForkliftTrans } from 'src/utils';

import { ExternalLink } from '@kubev2v/common';

export const CREATE_VDDK_HELP_LINK =
  'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.8/html-single/installing_and_using_the_migration_toolkit_for_virtualization/index#creating-vddk-image_mtv';

export const VDDKHelperText: React.FC = () => (
  <ForkliftTrans>
    <p>VMware Virtual Disk Development Kit (VDDK) image.</p>
    <br />
    <p>
      The Migration Toolkit for Virtualization (MTV) uses the VMware Virtual Disk Development Kit
      (VDDK) SDK to accelerate transferring virtual disks from VMware vSphere. Therefore, creating a
      VDDK image, although optional, is highly recommended.
    </p>
    <br />

    <p>
      To accelerate migrations, we recommend to create a VDDK init image. Learn more about{' '}
      <ExternalLink isInline href={CREATE_VDDK_HELP_LINK}>
        Creating a VDDK image
      </ExternalLink>
      .
    </p>
  </ForkliftTrans>
);

export const VDDKHelperTextShort: React.FC = () => (
  <ForkliftTrans>
    <p>
      To accelerate migrations, we recommend to create a VDDK init image. Learn more about{' '}
      <ExternalLink isInline href={CREATE_VDDK_HELP_LINK}>
        Creating a VDDK image
      </ExternalLink>
      .
    </p>
  </ForkliftTrans>
);
