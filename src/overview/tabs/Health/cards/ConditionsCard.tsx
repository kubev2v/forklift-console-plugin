import type { FC } from 'react';
import { ConditionsSection } from 'src/components/ConditionsSection/ConditionsSection';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { K8sResourceCondition, V1beta1ForkliftController } from '@forklift-ui/types';
import { Card, CardBody, CardTitle } from '@patternfly/react-core';

type ConditionsCardProps = {
  obj?: V1beta1ForkliftController;
};

const ConditionsCard: FC<ConditionsCardProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();
  const status = obj?.status as
    | {
        conditions?: K8sResourceCondition[];
      }
    | undefined;

  return (
    <Card className="pf-m-full-height">
      <CardTitle className="forklift-title">{t('Conditions')}</CardTitle>
      <CardBody>
        {status?.conditions && <ConditionsSection conditions={status.conditions} />}
      </CardBody>
    </Card>
  );
};

export default ConditionsCard;
