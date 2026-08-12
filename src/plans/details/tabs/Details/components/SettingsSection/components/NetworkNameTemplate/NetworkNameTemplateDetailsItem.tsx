import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';

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

  if (!shouldRender) {
    return null;
  }

  const content = (
    <Label color="grey" isCompact>
      {plan?.spec?.networkNameTemplate ? t('Use custom') : t('Use default')}
    </Label>
  );

  return (
    <DetailsItem
      canEdit={canPatch && isPlanEditable(plan)}
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
      title={t('Network name template')}
    />
  );
};

export default NetworkNameTemplateDetailsItem;
