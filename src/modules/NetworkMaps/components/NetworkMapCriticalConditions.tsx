import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Linkify from 'react-linkify';
import { EMPTY_MSG } from 'src/utils/constants';

import { Alert, Text, TextContent, TextVariants } from '@patternfly/react-core';

const NetworkMapCriticalConditions: FC<{ type: string; message: string }> = ({ message, type }) => {
  const { t } = useTranslation();
  return (
    <Alert title={type} variant="danger">
      <TextContent className="forklift-providers-list-header__alert">
        <Text component={TextVariants.p}>
          <Linkify>{message || EMPTY_MSG}</Linkify>
          <br />
          {t('To troubleshoot, check the Forklift controller pod logs.')}
        </Text>
      </TextContent>
    </Alert>
  );
};

export default NetworkMapCriticalConditions;
