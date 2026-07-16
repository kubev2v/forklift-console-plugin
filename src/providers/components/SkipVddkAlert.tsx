import type { FC } from 'react';

import { Alert, AlertVariant } from '@patternfly/react-core';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

const SkipVddkAlert: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <Alert
      variant={AlertVariant.warning}
      isInline
      title={t('It is highly recommended to use a VDDK image.')}
    >
      <ForkliftTrans>
        <p>
          Not using a VDDK image could result in significantly lower migration speeds or a plan
          failing.
        </p>
      </ForkliftTrans>
    </Alert>
  );
};

export default SkipVddkAlert;
