import type { FC } from 'react';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { useForkliftTranslation } from '@utils/i18n';

const ExcludeDiskBusAddressHelpPopover: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <HelpIconPopover header={t('Bus address')}>
      {t('vSphere disk bus address stored in the plan as excludeDisks (for example, scsi0:1).')}
    </HelpIconPopover>
  );
};

export default ExcludeDiskBusAddressHelpPopover;
