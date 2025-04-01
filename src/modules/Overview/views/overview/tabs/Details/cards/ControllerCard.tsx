import React, { FC } from 'react';
import { Suspend } from 'src/modules/Plans/views/details/components/Suspend';
import { useForkliftTranslation } from 'src/utils/i18n';

import { IoK8sApiCoreV1Pod, V1beta1ForkliftController } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Card, CardBody, CardTitle } from '@patternfly/react-core';

import { PodsTable } from '../../../components/PodsTable';

type ControllerCardProps = {
  obj?: V1beta1ForkliftController;
};

const ControllerCard: FC<ControllerCardProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();

  const [pods, loaded, loadError] = useK8sWatchResource<IoK8sApiCoreV1Pod[]>({
    kind: 'Pod',
    namespaced: true,
    isList: true,
    namespace: obj?.metadata?.namespace,
    selector: { matchLabels: { app: 'forklift' } },
  });

  return (
    <Card>
      <CardTitle className="forklift-title">{t('Pods')}</CardTitle>
      <Suspend obj={pods} loaded={loaded} loadError={loadError}>
        <CardBody>
          <PodsTable pods={pods} />
        </CardBody>
      </Suspend>
    </Card>
  );
};

export default ControllerCard;
