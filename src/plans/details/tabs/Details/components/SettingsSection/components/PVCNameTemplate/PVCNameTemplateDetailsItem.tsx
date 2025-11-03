import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';

import type { EditableDetailsItemProps } from '../../../utils/types';

import { onConfirmPVCNameTemplate } from './utils/utils';
import EditPVCNameTemplate, { type EditPVCNameTemplateProps } from './EditPVCNameTemplate';

const PVCNameTemplateDetailsItem: FC<EditableDetailsItemProps> = ({
  canPatch,
  plan,
  shouldRender,
}) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  if (!shouldRender) return null;

  const content = (
    <Label isCompact color="grey">
      {plan?.spec?.pvcNameTemplate ? t('Use custom') : t('Use default')}
    </Label>
  );

  return (
    <DetailsItem
      title={t('PVC name template')}
      content={content}
      crumbs={['spec', 'pvcNameTemplate']}
      onEdit={() => {
        launcher<EditPVCNameTemplateProps>(EditPVCNameTemplate, {
          allowInherit: false,
          onConfirmPVCNameTemplate,
          resource: plan,
          value: plan?.spec?.pvcNameTemplate,
        });
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default PVCNameTemplateDetailsItem;
