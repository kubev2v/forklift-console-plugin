import type { FC } from 'react';
import { Base64 } from 'js-base64';

import { DetailsItem } from '@components/DetailItems/DetailItem';
import type { V1beta1Hook } from '@forklift-ui/types';
import { CodeBlock, CodeBlockCode } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

type LocalHookDetailsProps = {
  hook: V1beta1Hook;
};

const LocalHookDetails: FC<LocalHookDetailsProps> = ({ hook }) => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <DetailsItem
        testId="hook-runner-image-detail-item"
        title={t('Hook runner image')}
        content={hook?.spec?.image ?? t('None')}
      />
      <DetailsItem
        testId="service-account-detail-item"
        title={t('Service account')}
        content={isEmpty(hook?.spec?.serviceAccount) ? t('None') : hook?.spec?.serviceAccount}
      />
      <DetailsItem
        testId="playbook-detail-item"
        title={t('Ansible playbook')}
        content={
          hook?.spec?.playbook ? (
            <CodeBlock>
              <CodeBlockCode className="playbook-code-block">
                {Base64.decode(hook.spec.playbook)}
              </CodeBlockCode>
            </CodeBlock>
          ) : (
            t('None')
          )
        }
      />
    </>
  );
};

export default LocalHookDetails;
