import type { FC } from 'react';

import { Alert, AlertVariant } from '@patternfly/react-core';
import { FEATURE_NAMES } from '@utils/constants';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

const SkipVddkAlert: FC = () => {
  const { t } = useForkliftTranslation();
  const { isFeatureEnabled } = useFeatureFlags();

  if (isFeatureEnabled(FEATURE_NAMES.TOEHOLD)) {
    return (
      <Alert
        isInline
        title={t('VDDK is optional when toehold is enabled.')}
        variant={AlertVariant.info}
      >
        <ForkliftTrans>
          <p>
            Without a VDDK image, migrations use the toehold copy appliance. VDDK can still improve
            transfer performance when you configure it on the provider.
          </p>
        </ForkliftTrans>
      </Alert>
    );
  }

  return (
    <Alert
      isInline
      title={t('It is highly recommended to use a VDDK image.')}
      variant={AlertVariant.warning}
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
