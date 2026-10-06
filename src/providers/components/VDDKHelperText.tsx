import type { FC } from 'react';

import { FEATURE_NAMES } from '@utils/constants';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';
import { ForkliftTrans } from '@utils/i18n';

const VDDKHelperText: FC = () => {
  const { isFeatureEnabled } = useFeatureFlags();
  const toeholdEnabled = isFeatureEnabled(FEATURE_NAMES.TOEHOLD);

  if (toeholdEnabled) {
    return (
      <ForkliftTrans>
        <p>VMware Virtual Disk Development Kit (VDDK) image.</p>
        <br />
        <p>
          The migration toolkit for virtualization (MTV) can use the VMware Virtual Disk Development
          Kit (VDDK) SDK to accelerate transferring virtual disks from VMware vSphere. With toehold
          enabled, VDDK is optional; migrations without VDDK use the copy appliance instead.
        </p>
        <br />
        <p>Configuring a VDDK init image can still improve transfer performance.</p>
      </ForkliftTrans>
    );
  }

  return (
    <ForkliftTrans>
      <p>VMware Virtual Disk Development Kit (VDDK) image.</p>
      <br />
      <p>
        The migration toolkit for virtualization (MTV) uses the VMware Virtual Disk Development Kit
        (VDDK) SDK to accelerate transferring virtual disks from VMware vSphere. Therefore, creating
        a VDDK image, although optional, is highly recommended. Using MTV without VDDK is not
        recommended and could result in significantly lower migration speeds
      </p>
      <br />

      <p>
        To accelerate migration and reduce the risk of a plan failing, it is strongly recommended to
        create a VDDK init image.
      </p>
    </ForkliftTrans>
  );
};

export default VDDKHelperText;
