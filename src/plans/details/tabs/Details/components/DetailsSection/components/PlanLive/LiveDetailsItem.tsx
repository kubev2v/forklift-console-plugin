import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import PlanMigrationTypeLabel from 'src/plans/details/components/PlanMigrationTypeLabel/PlanMigrationTypeLabel';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { getPlanMigrationType } from 'src/plans/details/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { EditableDetailsItemProps } from '../../../utils/types';

import EditPlanLive from './EditPlanLive';

const LiveDetailsItem: FC<EditableDetailsItemProps> = ({ canPatch, plan, shouldRender }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  if (!shouldRender) return null;

  const migrationType = getPlanMigrationType(plan);
  return (
    <DetailsItem
      title={t('Migration type')}
      content={<PlanMigrationTypeLabel migrationType={migrationType} />}
      helpContent={t('Whether this is a live migration.')}
      crumbs={['spec', 'type']}
      onEdit={() => {
        showModal(<EditPlanLive resource={plan} />);
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default LiveDetailsItem;
