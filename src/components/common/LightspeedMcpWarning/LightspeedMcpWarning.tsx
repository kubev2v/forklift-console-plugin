import type { FC } from 'react';

import { Alert, Button, ButtonVariant, Content, ContentVariants } from '@patternfly/react-core';
import { INSTALLED_OPERATORS_URL } from '@utils/hooks/useLightspeedMcpStatus/constants';
import { useForkliftTranslation } from '@utils/i18n';

const LightspeedMcpWarning: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <Alert title={t('AI assistant not connected to Lightspeed')} variant="warning">
      <Content>
        <Content component={ContentVariants.p}>
          {t(
            'OpenShift Lightspeed was installed after the Migration Toolkit for Virtualization. Reinstall or update the MTV operator to connect the AI assistant to Lightspeed.',
          )}
        </Content>
      </Content>
      <Button component="a" href={INSTALLED_OPERATORS_URL} isInline variant={ButtonVariant.link}>
        {t('Go to Installed Operators')}
      </Button>
    </Alert>
  );
};

export default LightspeedMcpWarning;
