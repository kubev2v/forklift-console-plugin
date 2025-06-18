import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import PlanWarmLabel from 'src/plans/details/components/PlanWarmLabel/PlanWarmLabel';
import { useForkliftTranslation } from 'src/utils/i18n';

import { getPlanIsWarm } from '@utils/crds/plans/selectors';

import type { EditableDetailsItemProps } from '../../../utils/types';

import EditPlanWarm from './EditPlanWarm';

const WarmDetailsItem: FC<EditableDetailsItemProps> = ({ canPatch, plan, shouldRender }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  if (!shouldRender) return null;

  const isWarm = getPlanIsWarm(plan);
  return (
    <DetailsItem
      title={t('Migration type')}
      content={<PlanWarmLabel isWarm={isWarm} />}
      helpContent={t('Whether this is a warm migration.')}
      crumbs={['spec', 'warm']}
      onEdit={() => {
        showModal(<EditPlanWarm resource={plan} />);
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default WarmDetailsItem;
