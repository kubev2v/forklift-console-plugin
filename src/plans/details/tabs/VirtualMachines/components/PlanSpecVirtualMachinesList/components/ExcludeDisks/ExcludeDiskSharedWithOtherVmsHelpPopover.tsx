import type { FC } from 'react';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { useForkliftTranslation } from '@utils/i18n';

const ExcludeDiskSharedWithOtherVmsHelpPopover: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <HelpIconPopover header={t('Shared with other VMs')}>
      {t(
        'Yes if the same disk file is used by multiple VMs on the source provider (vSphere inventory). Unrelated to the plan Migrate shared disks setting.',
      )}
    </HelpIconPopover>
  );
};

export default ExcludeDiskSharedWithOtherVmsHelpPopover;
