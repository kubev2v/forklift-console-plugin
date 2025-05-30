import type { FC } from 'react';
import { ConditionsSection } from 'src/modules/Providers/views/details/components/ConditionsSection/ConditionsSection';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { K8sResourceCondition, V1beta1ForkliftController } from '@kubev2v/types';
import { Card, CardBody, CardTitle } from '@patternfly/react-core';

type ConditionsCardProps = {
  obj?: V1beta1ForkliftController & {
    status: {
      conditions: K8sResourceCondition[];
    };
  };
};

const ConditionsCard: FC<ConditionsCardProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();

  return (
    <Card className="pf-m-full-height">
      <CardTitle className="forklift-title">{t('Conditions')}</CardTitle>
      <CardBody>
        {obj?.status?.conditions && <ConditionsSection conditions={obj.status.conditions} />}
      </CardBody>
    </Card>
  );
};

export default ConditionsCard;
