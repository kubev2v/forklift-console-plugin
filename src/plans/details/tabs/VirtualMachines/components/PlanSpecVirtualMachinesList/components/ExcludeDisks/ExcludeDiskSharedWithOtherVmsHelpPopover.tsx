import type { FC } from 'react';

import { useForkliftTranslation } from '@utils/i18n';

const ExcludeDiskSharedWithOtherVmsHelpPopover: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <>
      {t(
        'Yes if the same disk file is used by multiple VMs on the source provider (vSphere inventory). Unrelated to the plan Migrate shared disks setting.',
      )}
    </>
  );
};

export default ExcludeDiskSharedWithOtherVmsHelpPopover;
