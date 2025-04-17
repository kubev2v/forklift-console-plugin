import { type FC, useMemo } from 'react';
import Linkify from 'react-linkify';

import type { V1beta1NetworkMap, V1beta1Plan } from '@kubev2v/types';
import { Alert, AlertVariant, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { getName } from '@utils/crds/common/selectors';
import { getPlanNetworkMapName, getPlanPreserveIP } from '@utils/crds/plans/selectors';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

import { POD } from '../utils/constants';

type PlanPreserveIPWarningProps = {
  plan: V1beta1Plan;
  networkMaps: V1beta1NetworkMap[];
  loaded: boolean;
  error: Error | null;
};

const PlanPreserveIPWarning: FC<PlanPreserveIPWarningProps> = ({
  error,
  loaded,
  networkMaps,
  plan,
}) => {
  const { t } = useForkliftTranslation();

  const shouldWarn = useMemo(() => {
    if (!loaded || error) return false;
    const isPreserveStaticIPs = getPlanPreserveIP(plan);
    const networkMap = networkMaps.find((net) => getName(net) === getPlanNetworkMapName(plan));
    const isMapToPod =
      networkMap?.spec?.map.some((entry) => entry.destination.type === POD) ?? false;
    return Boolean(isPreserveStaticIPs && isMapToPod);
  }, [error, loaded, networkMaps, plan]);

  if (!shouldWarn) return null;

  return (
    <Alert
      title={t(
        'The plan migration might not work as expected - choose a different mapping for your migration plan',
      )}
      variant={AlertVariant.warning}
    >
      <TextContent className="forklift-providers-list-header__alert">
        <Text component={TextVariants.p}>
          <Linkify>
            {t(
              "Your migration plan preserves the static IPs of VMs and uses Pod Networking target network mapping. This combination isn't supported, because VM IPs aren't preserved in Pod Networking migrations.",
            )}
          </Linkify>
        </Text>
        <Text component={TextVariants.p}>
          <Linkify>
            <ForkliftTrans>
              If your VMs use static IPs, click the Mappings tab of your plan, and choose a
              different target network mapping.
              <br />
              If your VMs do not use static IPs, you can ignore this message.
            </ForkliftTrans>
          </Linkify>
        </Text>
      </TextContent>
    </Alert>
  );
};

export default PlanPreserveIPWarning;
