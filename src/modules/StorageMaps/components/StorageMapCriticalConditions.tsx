import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import SmartLinkify from 'src/components/common/SmartLinkify';
import { EMPTY_MSG } from 'src/utils/constants';

import { Alert, Content, ContentVariants } from '@patternfly/react-core';

const StorageMapCriticalConditions: FC<{ type: string; message: string }> = ({ message, type }) => {
  const { t } = useTranslation();

  return (
    <Alert title={type} variant="danger">
      <Content className="forklift-providers-list-header__alert">
        <Content component={ContentVariants.p}>
          <SmartLinkify>{message || EMPTY_MSG}</SmartLinkify>
          <br />
          {t('To troubleshoot, check the Forklift controller pod logs.')}
        </Content>
      </Content>
    </Alert>
  );
};

export default StorageMapCriticalConditions;
