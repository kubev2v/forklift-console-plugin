import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Linkify from 'react-linkify';
import { EMPTY_MSG } from 'src/utils/constants';

import { Alert, AlertVariant, Text, TextContent, TextVariants } from '@patternfly/react-core';

const PlanWarningCondition: React.FC<{
  type: string;
  message: string;
  suggestion: ReactNode;
}> = ({ message, suggestion, type }) => {
  const { t } = useTranslation();
  return (
    <Alert
      title={`${t('The plan migration might not work as expected')} - ${type}`}
      variant={AlertVariant.warning}
    >
      <TextContent className="forklift-providers-list-header__alert">
        <Text component={TextVariants.p}>
          <Linkify>{message || EMPTY_MSG}</Linkify>
          <br />
          <br />
          <Linkify>{suggestion || EMPTY_MSG}</Linkify>
        </Text>
      </TextContent>
    </Alert>
  );
};

export default PlanWarningCondition;
