import type { FC } from 'react';

import { useForkliftTranslation } from '@utils/i18n';

const ExcludeDiskBusAddressHelpPopover: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <>{t('vSphere disk bus address stored in the plan as excludeDisks (for example, scsi0:1).')}</>
  );
};

export default ExcludeDiskBusAddressHelpPopover;
