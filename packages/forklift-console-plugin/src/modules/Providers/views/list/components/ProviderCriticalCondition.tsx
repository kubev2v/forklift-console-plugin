import React from 'react';
import { useTranslation } from 'react-i18next';
import Linkify from 'react-linkify';

import { Alert, Text, TextContent, TextVariants } from '@patternfly/react-core';

export const ProviderCriticalCondition: React.FC<{ type: string; message: string }> = ({
  type,
  message,
}) => {
  const { t } = useTranslation();
  return (
    <Alert title={t('The provider is not ready - ') + type} variant="danger">
      <TextContent className="forklift-providers-list-header__alert">
        <Text component={TextVariants.p}>
          <Linkify>{message || '-'}</Linkify>
          {'. '}
          {t('To troubleshoot, check the Forklift controller pod logs.')}
        </Text>
      </TextContent>
    </Alert>
  );
};

export default ProviderCriticalCondition;
