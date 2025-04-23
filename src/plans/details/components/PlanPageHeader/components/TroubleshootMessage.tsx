import type { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { Button, ButtonVariant } from '@patternfly/react-core';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

import type { PlanConditionType } from '../utils/constants';
import { getTroubleshootMessage } from '../utils/utils';

type TroubleshootMessageProps = {
  planURL: string;
  type: PlanConditionType;
};

const TroubleshootMessage: FC<TroubleshootMessageProps> = ({ planURL, type }) => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();

  if (getTroubleshootMessage(type)) {
    return (
      <ForkliftTrans>
        To troubleshoot, check and edit your plan{' '}
        <Button
          isInline
          variant={ButtonVariant.link}
          onClick={() => {
            navigate(`${planURL}/mappings`);
          }}
        >
          mappings
        </Button>
        .
      </ForkliftTrans>
    );
  }

  return <>{t('To troubleshoot, check the Forklift controller pod logs.')}</>;
};

export default TroubleshootMessage;
