import type { FC } from 'react';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { Label, Popover } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

const DevPreviewLabel: FC = () => {
  const { t } = useForkliftTranslation();
  return (
    <Popover
      triggerAction="hover"
      bodyContent={t(
        'Developer Preview features are not intended to be used in production environments. The clusters deployed with the Developer Preview features are considered to be development clusters and are not supported through the Red Hat Customer Portal case management system.',
      )}
      footerContent={
        <ExternalLink isInline href="https://access.redhat.com/articles/6966848">
          {t('Learn more')}
        </ExternalLink>
      }
    >
      <Label isCompact color="purple" icon={<InfoCircleIcon />}>
        {t('Developer Preview')}
      </Label>
    </Popover>
  );
};

export default DevPreviewLabel;
