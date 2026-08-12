import type { FC } from 'react';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { Alert, AlertVariant, Stack } from '@patternfly/react-core';
import { CREATE_VDDK_HELP_LINK } from '@utils/constants';
import { useForkliftTranslation } from '@utils/i18n';

const PlanVddkForWarmWarningAlert: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <Alert
      className="pf-v6-u-ml-lg"
      isInline
      title={t('Must enable VMware Virtual Disk Development Kit')}
      variant={AlertVariant.warning}
    >
      <Stack hasGutter>
        {t(
          'To do a warm migration, you must set up VDDK for the selected VMware provider. If VDDK is not set up before starting the migration plan, the migration will fail.',
        )}

        {CREATE_VDDK_HELP_LINK && (
          <ExternalLink hideIcon href={CREATE_VDDK_HELP_LINK} isInline>
            {t('Learn more about VDDK')}
          </ExternalLink>
        )}
      </Stack>
    </Alert>
  );
};

export default PlanVddkForWarmWarningAlert;
