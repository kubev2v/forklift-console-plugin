import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, Content, ContentVariants } from '@patternfly/react-core';

const InventoryNotReachable: FC = () => {
  const { t } = useTranslation();
  return (
    <Alert title={t('Inventory')} variant="warning">
      <Content>
        <Content component={ContentVariants.p}>
          {t(
            'Inventory server is not reachable. To troubleshoot, check the Forklift controller pod logs.',
          )}
        </Content>
      </Content>
    </Alert>
  );
};

export default InventoryNotReachable;
