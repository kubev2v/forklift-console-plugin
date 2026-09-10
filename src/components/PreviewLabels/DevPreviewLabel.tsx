import type { FC } from 'react';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { Label, Popover } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

const DevPreviewLabel: FC = () => {
  const { t } = useForkliftTranslation();
  return (
    <Popover
      bodyContent={t(
        'Developer Preview features provide early access to upcoming product innovations, enabling you to test functionality and provide feedback. Developer Preview features are not supported by Red Hat in any way and are not functionally complete or production-ready.',
      )}
      footerContent={
        <ExternalLink href="https://access.redhat.com/articles/6966848" isInline>
          {t('Learn more')}
        </ExternalLink>
      }
      triggerAction="hover"
    >
      <Label color="teal" icon={<InfoCircleIcon />} isCompact>
        {t('Developer Preview')}
      </Label>
    </Popover>
  );
};

export default DevPreviewLabel;
