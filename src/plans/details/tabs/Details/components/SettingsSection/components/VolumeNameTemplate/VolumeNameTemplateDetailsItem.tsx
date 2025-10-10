import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Label } from '@patternfly/react-core';

import type { EditableDetailsItemProps } from '../../../utils/types';

import { onConfirmVolumeNameTemplate } from './utils/utils';
import EditVolumeNameTemplate from './EditVolumeNameTemplate';

const VolumeNameTemplateDetailsItem: FC<EditableDetailsItemProps> = ({
  canPatch,
  plan,
  shouldRender,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  if (!shouldRender) return null;

  const content = plan?.spec?.volumeNameTemplate ? (
    <Label isCompact color="grey">
      {t('Use custom')}
    </Label>
  ) : (
    <Label isCompact color="grey">
      {t('Use default')}
    </Label>
  );

  return (
    <DetailsItem
      title={t('Volume name template')}
      content={content}
      crumbs={['spec', 'volumeNameTemplate']}
      onEdit={() => {
        showModal(
          <EditVolumeNameTemplate
            allowInherit={false}
            onConfirmVolumeNameTemplate={onConfirmVolumeNameTemplate}
            resource={plan}
            value={plan?.spec?.volumeNameTemplate}
          />,
        );
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default VolumeNameTemplateDetailsItem;
