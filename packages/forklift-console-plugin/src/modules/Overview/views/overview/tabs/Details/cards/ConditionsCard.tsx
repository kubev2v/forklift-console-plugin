import React, { FC } from 'react';
import { ConditionsSection } from 'src/modules/Providers/views';
import { useForkliftTranslation } from 'src/utils/i18n';

import { V1beta1ForkliftController } from '@kubev2v/types';
import { Card, CardBody, CardTitle } from '@patternfly/react-core';

type ConditionsCardProps = {
  obj?: V1beta1ForkliftController;
  loaded?: boolean;
  loadError?: unknown;
};

export const ConditionsCard: FC<ConditionsCardProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();

  return (
    <Card>
      <CardTitle>{t('Conditions')}</CardTitle>
      <CardBody>
        <ConditionsSection conditions={obj?.status?.['conditions']} />
      </CardBody>
    </Card>
  );
};

export default ConditionsCard;
