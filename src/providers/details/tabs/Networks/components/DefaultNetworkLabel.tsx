import type { FC, ReactElement } from 'react';

import { Label } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

const DefaultNetworkLabel: FC = (): ReactElement => {
  const { t } = useForkliftTranslation();

  return (
    <Label isCompact color={'green'}>
      {t('Default')}
    </Label>
  );
};

export default DefaultNetworkLabel;
