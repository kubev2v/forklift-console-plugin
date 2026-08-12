import type { FC } from 'react';
import { Link } from 'react-router';
import TabTitle from 'src/overview/components/TabTitle';
import { useForkliftTranslation } from 'src/utils/i18n';

import LoadingSuspend from '@components/LoadingSuspend';
import type { IoK8sApiCoreV1Pod, V1beta1ForkliftController } from '@forklift-ui/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';

import { PodsTable } from './PodsTable';

type ControllerCardProps = {
  limit?: number;
  obj?: V1beta1ForkliftController;
};

const ControllerCard: FC<ControllerCardProps> = ({ limit, obj }) => {
  const { t } = useForkliftTranslation();

  const [pods, loaded, loadError] = useK8sWatchResource<IoK8sApiCoreV1Pod[]>({
    isList: true,
    kind: 'Pod',
    limit,
    namespace: obj?.metadata?.namespace,
    namespaced: true,
    selector: { matchLabels: { app: 'forklift' } },
  });

  return (
    <Card className="pf-m-full-height" data-testid="health-controller-card">
      <CardHeader
        actions={{
          actions: limit ? <Link to={'health'}>View all</Link> : null,
        }}
      >
        <CardTitle className="forklift-title">
          <TabTitle
            helpContent={t(
              'Health indicates the current status of the pods related to the migration toolkit for virtualization, including whether any have failed. For more details, refer to the logs.',
            )}
            title={t('Health')}
          />
        </CardTitle>
      </CardHeader>
      <LoadingSuspend loaded={loaded} loadError={loadError} obj={pods}>
        <CardBody>
          <div className="forklift-overview__pods-table">
            <PodsTable limit={limit} pods={pods} />
          </div>
        </CardBody>
      </LoadingSuspend>
    </Card>
  );
};

export default ControllerCard;
