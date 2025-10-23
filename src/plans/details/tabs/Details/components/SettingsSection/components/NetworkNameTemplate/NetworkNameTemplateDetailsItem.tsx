import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useModal } from '@openshift-console/dynamic-plugin-sdk';

import type { EditableDetailsItemProps } from '../../../utils/types';

import { onConfirmPlanNetworkNameTemplate } from './utils/utils';
import EditNetworkNameTemplate, {
  type EditNetworkNameTemplateProps,
} from './EditNetworkNameTemplate';

const NetworkNameTemplateDetailsItem: FC<EditableDetailsItemProps> = ({
  canPatch,
  plan,
  shouldRender,
}) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  if (!shouldRender) return null;

  const content = plan?.spec?.networkNameTemplate ? (
    t('Use custom')
  ) : (
    <span className="text-muted">{t('Use default')}</span>
  );

  return (
    <DetailsItem
      title={t('Network name template')}
      content={content}
      crumbs={['spec', 'networkNameTemplate']}
      onEdit={() => {
        launcher<EditNetworkNameTemplateProps>(EditNetworkNameTemplate, {
          allowInherit: false,
          onConfirmNetworkNameTemplate: onConfirmPlanNetworkNameTemplate,
          resource: plan,
          value: plan?.spec?.networkNameTemplate,
        });
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default NetworkNameTemplateDetailsItem;
