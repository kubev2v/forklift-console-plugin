import React from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, Text, TextContent, TextVariants } from '@patternfly/react-core';

export const InventoryNotReachable: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Alert title={t('Inventory')} variant="warning">
      <TextContent>
        <Text component={TextVariants.p}>
          {t(
            'Inventory server is not reachable. To troubleshoot, check the Forklift controller pod logs.',
          )}
        </Text>
      </TextContent>
    </Alert>
  );
};

export default InventoryNotReachable;
