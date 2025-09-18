import type { FC } from 'react';
import Linkify from 'react-linkify';

import { Alert, AlertVariant, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

const PlanPreserveIPWarning: FC = () => {
  const { t } = useForkliftTranslation();

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
