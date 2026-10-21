import type { FC } from 'react';

import { Alert, AlertVariant } from '@patternfly/react-core';
import { FEATURE_NAMES } from '@utils/constants';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

const SkipVddkAlert: FC = () => {
  const { t } = useForkliftTranslation();
  const { isFeatureEnabled } = useFeatureFlags();

  if (isFeatureEnabled(FEATURE_NAMES.COPY_APPLIANCE)) {
    return (
      <Alert
        isInline
        title={t('Disk transfer must be configured before migration.')}
        variant={AlertVariant.warning}
      >
        <ForkliftTrans>
          <p>
            Add a VDDK image or deploy a sourcing appliance template on the provider details page
            before creating a plan.
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
