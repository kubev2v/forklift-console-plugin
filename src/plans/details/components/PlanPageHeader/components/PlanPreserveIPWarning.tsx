import type { FC } from 'react';
import Linkify from 'react-linkify';

import { Alert, AlertVariant, Content, ContentVariants } from '@patternfly/react-core';
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
      <Content className="forklift-providers-list-header__alert">
        <Content component={ContentVariants.p}>
          <Linkify>
            {t(
              "Your migration plan preserves the static IPs of VMs and uses Pod Networking target network mapping. This combination isn't supported, because VM IPs aren't preserved in Pod Networking migrations.",
            )}
          </Linkify>
        </Content>
        <Content component={ContentVariants.p}>
          <Linkify>
            <ForkliftTrans>
              If your VMs use static IPs, click the Mappings tab of your plan, and choose a
              different target network mapping.
              <br />
              If your VMs do not use static IPs, you can ignore this message.
            </ForkliftTrans>
          </Linkify>
        </Content>
      </Content>
    </Alert>
  );
};

export default PlanPreserveIPWarning;
