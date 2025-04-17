import type { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { Button, ButtonVariant } from '@patternfly/react-core';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

import { PlanConditionType } from '../utils/constants';

type TroubleshootMessageProps = {
  planURL: string;
  type: PlanConditionType;
};

const TroubleshootMessage: FC<TroubleshootMessageProps> = ({ planURL, type }) => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();

  if (
    [
      PlanConditionType.VMNetworksNotMapped,
      PlanConditionType.VMStorageNotMapped,
      PlanConditionType.VMMultiplePodNetworkMappings,
    ].includes(type)
  ) {
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
