import type { FC } from 'react';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { Alert, AlertVariant, Stack } from '@patternfly/react-core';
import { CREATE_VDDK_HELP_LINK } from '@utils/constants';
import { useForkliftTranslation } from '@utils/i18n';

const PlanVddkForSharedDisksWarningAlert: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <Alert
      isInline
      title={t('Must enable VMware Virtual Disk Development Kit')}
      variant={AlertVariant.warning}
      className="pf-v6-u-mt-sm pf-v6-u-ml-lg"
    >
      <Stack hasGutter>
        {t(
          'Disabling shared disk migration requires VDDK to be configured on the VMware provider. Without VDDK, the migration will stall. Either enable VDDK on the provider or keep shared disk migration enabled.',
        )}

        <ExternalLink isInline hideIcon href={CREATE_VDDK_HELP_LINK}>
          {t('Learn more about VDDK')}
        </ExternalLink>
      </Stack>
    </Alert>
  );
};

export default PlanVddkForSharedDisksWarningAlert;
