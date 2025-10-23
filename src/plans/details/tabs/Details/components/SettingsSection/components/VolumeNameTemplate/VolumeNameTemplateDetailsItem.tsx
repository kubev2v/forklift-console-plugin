import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useModal } from '@openshift-console/dynamic-plugin-sdk';

import type { EditableDetailsItemProps } from '../../../utils/types';

import { onConfirmVolumeNameTemplate } from './utils/utils';
import EditVolumeNameTemplate, { type EditVolumeNameTemplateProps } from './EditVolumeNameTemplate';

const VolumeNameTemplateDetailsItem: FC<EditableDetailsItemProps> = ({
  canPatch,
  plan,
  shouldRender,
}) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  if (!shouldRender) return null;

  const content = plan?.spec?.volumeNameTemplate ? (
    t('Use custom')
  ) : (
    <span className="text-muted">{t('Use default')}</span>
  );

  return (
    <DetailsItem
      title={t('Volume name template')}
      content={content}
      crumbs={['spec', 'volumeNameTemplate']}
      onEdit={() => {
        launcher<EditVolumeNameTemplateProps>(EditVolumeNameTemplate, {
          allowInherit: false,
          onConfirmVolumeNameTemplate,
          resource: plan,
          value: plan?.spec?.volumeNameTemplate,
        });
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default VolumeNameTemplateDetailsItem;
