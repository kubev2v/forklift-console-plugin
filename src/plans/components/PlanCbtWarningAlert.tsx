import type { FC } from 'react';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { Alert, AlertVariant, Stack } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { CBT_HELP_LINK } from '@utils/links';

type PlanCbtWarningAlertProps = {
  cbtDisabledVmsCount: number;
};

const PlanCbtWarningAlert: FC<PlanCbtWarningAlertProps> = ({ cbtDisabledVmsCount }) => {
  const { t } = useForkliftTranslation();

  return (
    <Alert
      className="pf-v6-u-ml-lg"
      isInline
      title={t('Must enable Changed Block Tracking (CBT) for warm migration')}
      variant={AlertVariant.warning}
    >
      <Stack hasGutter>
        <p>
          {cbtDisabledVmsCount} {t('of your selected VMs do not have CBT enabled.')}
          <br />
          {t(
            'Switch those VMs to cold migration or enable CBT in VMware before running the plan; otherwise the migration will fail.',
          )}
        </p>
        <ExternalLink href={CBT_HELP_LINK} isInline>
          {t('Learn more')}
        </ExternalLink>
      </Stack>
    </Alert>
  );
};

export default PlanCbtWarningAlert;
