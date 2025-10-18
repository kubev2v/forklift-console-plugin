import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/useModal';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { EditableDetailsItemProps } from '../../../utils/types';

import { onConfirmPVCNameTemplate } from './utils/utils';
import EditPVCNameTemplate from './EditPVCNameTemplate';

const PVCNameTemplateDetailsItem: FC<EditableDetailsItemProps> = ({
  canPatch,
  plan,
  shouldRender,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  if (!shouldRender) return null;

  const content = plan?.spec?.pvcNameTemplate ? (
    t('Use custom')
  ) : (
    <span className="text-muted">{t('Use default')}</span>
  );

  return (
    <DetailsItem
      title={t('PVC name template')}
      content={content}
      crumbs={['spec', 'pvcNameTemplate']}
      onEdit={() => {
        showModal(
          <EditPVCNameTemplate
            allowInherit={false}
            resource={plan}
            onConfirmPVCNameTemplate={onConfirmPVCNameTemplate}
            value={plan?.spec?.pvcNameTemplate}
          />,
        );
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default PVCNameTemplateDetailsItem;
