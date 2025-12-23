import type { FC } from 'react';
import { ExternalLink } from 'src/components/common/ExternalLink/ExternalLink';
import { CREATE_VDDK_HELP_LINK } from 'src/plans/details/utils/constants';
import { ForkliftTrans } from 'src/utils/i18n';

const VDDKHelperText: FC = () => (
  <ForkliftTrans>
    <p>VMware Virtual Disk Development Kit (VDDK) image.</p>
    <br />
    <p>
      The migration toolkit for virtualization (MTV) uses the VMware Virtual Disk Development Kit
      (VDDK) SDK to accelerate transferring virtual disks from VMware vSphere. Therefore, creating a
      VDDK image, although optional, is highly recommended. Using MTV without VDDK is not
      recommended and could result in significantly lower migration speeds
    </p>
    <br />

    <p>
      To accelerate migration and reduce the risk of a plan failing, it is strongly recommended to
      create a VDDK init image. Learn more about{' '}
      <ExternalLink isInline href={CREATE_VDDK_HELP_LINK}>
        Creating a VDDK image
      </ExternalLink>
      .
    </p>
  </ForkliftTrans>
);

export default VDDKHelperText;
