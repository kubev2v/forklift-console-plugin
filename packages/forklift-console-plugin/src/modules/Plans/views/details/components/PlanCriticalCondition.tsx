import React from 'react';
import { useTranslation } from 'react-i18next';
import Linkify from 'react-linkify';
import { EMPTY_MSG } from 'src/utils/constants';

import { Alert, AlertVariant, Text, TextContent, TextVariants } from '@patternfly/react-core';

const PlanCriticalCondition: React.FC<{ type: string; message: string }> = ({ type, message }) => {
  const { t } = useTranslation();
  return (
    <Alert title={t('The plan is not ready') + ' - ' + type} variant={AlertVariant.danger}>
      <TextContent className="forklift-providers-list-header__alert">
        <Text component={TextVariants.p}>
          <Linkify>{message || EMPTY_MSG}</Linkify>
          {'. '}
          {t('To troubleshoot, check the Forklift controller pod logs.')}
        </Text>
      </TextContent>
    </Alert>
  );
};

export default PlanCriticalCondition;
