import type { FC } from 'react';
import { isPlanEditable } from 'src/modules/Plans/utils/helpers/getPlanPhase';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Label } from '@patternfly/react-core';
import { getPlanIsWarm } from '@utils/crds/plans/selectors';

import type { SettingsDetailsItemProps } from '../utils/types';

import EditPlanWarm from './EditPlanWarm/EditPlanWarm';

const WarmDetailsItem: FC<SettingsDetailsItemProps> = ({ canPatch, plan, shouldRender }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  if (!shouldRender) return null;

  const isWarm = getPlanIsWarm(plan);
  return (
    <DetailsItem
      title={t('Migration type')}
      content={
        <Label isCompact color={isWarm ? 'orange' : 'blue'}>
          {isWarm ? t('warm') : t('cold')}
        </Label>
      }
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
