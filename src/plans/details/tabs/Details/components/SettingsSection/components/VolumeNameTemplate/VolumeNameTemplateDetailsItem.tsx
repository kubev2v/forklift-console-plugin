import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/planStatusPermissions';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';

import type { EditableDetailsItemProps } from '../../../utils/types';

import { onConfirmVolumeNameTemplate } from './utils/utils';
import EditVolumeNameTemplate, { type EditVolumeNameTemplateProps } from './EditVolumeNameTemplate';

const VolumeNameTemplateDetailsItem: FC<EditableDetailsItemProps> = ({
  canPatch,
  plan,
  shouldRender,
}) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();

  if (!shouldRender) {
    return null;
  }

  const content = (
    <Label color="grey" isCompact>
      {plan?.spec?.volumeNameTemplate ? t('Use custom') : t('Use default')}
    </Label>
  );

  return (
    <DetailsItem
      canEdit={canPatch && isPlanEditable(plan)}
      content={content}
      crumbs={['spec', 'volumeNameTemplate']}
      onEdit={() => {
        launchOverlay<EditVolumeNameTemplateProps>(EditVolumeNameTemplate, {
          allowInherit: false,
          onConfirmVolumeNameTemplate,
          resource: plan,
          value: plan?.spec?.volumeNameTemplate,
        });
      }}
      title={t('Volume name template')}
    />
  );
};

export default VolumeNameTemplateDetailsItem;
