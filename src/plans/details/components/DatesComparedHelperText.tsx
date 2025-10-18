import type { FC } from 'react';

import { HelperText, HelperTextItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

const DatesComparedHelperText: FC = () => {
  const { t } = useForkliftTranslation();
  return (
    <HelperText>
      <HelperTextItem>
        {t('Dates are compared in UTC. End of the interval is included.')}
      </HelperTextItem>
    </HelperText>
  );
};

export default DatesComparedHelperText;
