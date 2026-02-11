import type { FC } from 'react';
import { Base64 } from 'js-base64';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';

import { DetailsItem } from '@components/DetailItems/DetailItem';
import SectionHeadingWithEdit from '@components/headers/SectionHeadingWithEdit';
import type { V1beta1Hook, V1beta1Plan } from '@forklift-ui/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { CodeBlock, CodeBlockCode, DescriptionList } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { HookType } from '../../utils/constants';
import HookEdit, { type HookEditProps } from '../HookEdit/HookEdit';

import './HookSection.scss';

type HookSectionProps = {
  hook: V1beta1Hook | undefined;
  title: string;
  step: HookType;
  plan: V1beta1Plan;
};

const HookSection: FC<HookSectionProps> = ({ hook, plan, step, title }) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  const planEditable = isPlanEditable(plan);
  const hookExists = !isEmpty(hook);

  return (
    <>
      <SectionHeadingWithEdit
        editable={planEditable}
        title={title}
        onClick={() => {
          launcher<HookEditProps>(HookEdit, { hook, plan, step });
        }}
        className="pf-v6-u-mt-md"
        headingLevel="h3"
        data-testid={`${step}-hook-edit-button`}
      />
      <DescriptionList>
        <DetailsItem
          testId="hook-enabled-detail-item"
          title={t('Enabled')}
          content={hookExists ? t('True') : t('False')}
        />
        {hookExists && (
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
        )}
      </DescriptionList>
    </>
  );
};

export default HookSection;
