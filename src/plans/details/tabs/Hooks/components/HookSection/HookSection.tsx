import type { FC } from 'react';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';

import { DetailsItem } from '@components/DetailItems/DetailItem';
import SectionHeadingWithEdit from '@components/headers/SectionHeadingWithEdit';
import type { V1beta1Hook, V1beta1Plan } from '@forklift-ui/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { HookType } from '../../utils/constants';
import { getAapConfig } from '../../utils/utils';
import HookEdit, { type HookEditProps } from '../HookEdit/HookEdit';

import AapHookDetails from './AapHookDetails';
import LocalHookDetails from './LocalHookDetails';

import './HookSection.scss';

type HookSectionProps = {
  hook: V1beta1Hook | undefined;
  plan: V1beta1Plan;
  step: HookType;
  title: string;
};

const HookSection: FC<HookSectionProps> = ({ hook, plan, step, title }) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  const planEditable = isPlanEditable(plan);
  const hookExists = !isEmpty(hook);
  const aapConfig = getAapConfig(hook);

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
        {hookExists && aapConfig && <AapHookDetails aap={aapConfig} />}
        {hookExists && !aapConfig && hook && <LocalHookDetails hook={hook} />}
      </DescriptionList>
    </>
  );
};

export default HookSection;
