import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Label } from '@patternfly/react-core';

import type { EditableDetailsItemProps } from '../../../utils/types';

import { onConfirmPlanNetworkNameTemplate } from './utils/utils';
import EditNetworkNameTemplate from './EditNetworkNameTemplate';

const NetworkNameTemplateDetailsItem: FC<EditableDetailsItemProps> = ({
  canPatch,
  plan,
  shouldRender,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  if (!shouldRender) return null;

  const content = plan?.spec?.networkNameTemplate ? (
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
      title={t('Network name template')}
      content={content}
      crumbs={['spec', 'networkNameTemplate']}
      onEdit={() => {
        showModal(
          <EditNetworkNameTemplate
            allowInherit={false}
            resource={plan}
            onConfirmNetworkNameTemplate={onConfirmPlanNetworkNameTemplate}
            value={plan?.spec?.networkNameTemplate}
          />,
        );
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default NetworkNameTemplateDetailsItem;
