import React from 'react';
import { ForkliftTrans } from 'src/utils';

import { ExternalLink } from '@kubev2v/common';

const CREATE_VDDK_HELP_LINK =
  'https://access.redhat.com/documentation/en-us/migration_toolkit_for_virtualization/2.6/html-single/installing_and_using_the_migration_toolkit_for_virtualization/index#creating-vddk-image_mtv';

export const VDDKHelperText = (
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
      To make use of this feature, you download the VMware Virtual Disk Development Kit (VDDK),
      build a VDDK image, and push the VDDK image to your image registry.{' '}
    </p>
    <br />

    <p>
      The VDDK package contains symbolic links, therefore, the procedure of creating a VDDK image
      must be performed on a file system that preserves symbolic links (symlinks).
    </p>
    <br />

    <p>
      The format of the URL of the VMware Virtual Disk Development Kit (VDDK) image should include a
      registry, project, image name, and optionally a version, for example:{' '}
      <strong>quay.io/kubev2v/vddk:latest</strong>.
    </p>
    <br />

    <p>
      It is strongly recommended to create a VDDK init image to accelerate migrations. For more
      information, see{' '}
      <ExternalLink isInline href={CREATE_VDDK_HELP_LINK}>
        Creating VDDK image
      </ExternalLink>
      .
    </p>
  </ForkliftTrans>
);
