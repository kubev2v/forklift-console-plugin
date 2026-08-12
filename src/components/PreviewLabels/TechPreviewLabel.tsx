import type { FC } from 'react';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { Label, Popover } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

const TechPreviewLabel: FC = () => {
  const { t } = useForkliftTranslation();
  return (
    <Popover
      bodyContent={t(
        'Technology Preview features are not supported with Red Hat production service level agreements (SLAs) and might not be functionally complete. Red Hat does not recommend using them in production.',
      )}
      footerContent={
        <ExternalLink href="https://access.redhat.com/articles/6966848" isInline>
          {t('Learn more')}
        </ExternalLink>
      }
      triggerAction="hover"
    >
      <Label color="purple" icon={<InfoCircleIcon />} isCompact>
        {t('Technology Preview')}
      </Label>
    </Popover>
  );
};

export default TechPreviewLabel;
