import type { FC } from 'react';

import { EMPTY_MSG } from '@utils/constants';
import { useForkliftTranslation } from '@utils/i18n';

type SharedWithOtherVmsCellProps = {
  shared: boolean | undefined;
};

const SharedWithOtherVmsCell: FC<SharedWithOtherVmsCellProps> = ({ shared }) => {
  const { t } = useForkliftTranslation();

  if (shared) {
    return <>{t('Yes')}</>;
  }

  if (shared === false) {
    return <>{t('No')}</>;
  }

  return <>{EMPTY_MSG}</>;
};

export default SharedWithOtherVmsCell;
