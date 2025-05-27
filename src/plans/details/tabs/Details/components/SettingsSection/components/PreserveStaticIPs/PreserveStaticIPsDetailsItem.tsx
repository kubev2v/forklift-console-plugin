import type { FC } from 'react';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Label } from '@patternfly/react-core';
import { getPlanPreserveIP } from '@utils/crds/plans/selectors';

import type { EditableDetailsItemProps } from '../../../utils/types';

import EditPlanPreserveStaticIPs from './EditPlanPreserveStaticIPs';

const PreserveStaticIPsDetailsItem: FC<EditableDetailsItemProps> = ({
  canPatch,
  plan,
  shouldRender,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  if (!shouldRender) return null;

  const preserveStaticIPs = getPlanPreserveIP(plan);

  return (
    <DetailsItem
      title={t('Preserve static IPs')}
      content={
        <Label isCompact color="grey">
          {preserveStaticIPs ? t('Preserve static IPs') : t('Do not preserve static IPs')}
        </Label>
      }
      helpContent={t(`Preserve the static IPs of virtual machines migrated from vSphere.`)}
      crumbs={['spec', 'preserveStaticIPs']}
      onEdit={() => {
        showModal(<EditPlanPreserveStaticIPs resource={plan} />);
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default PreserveStaticIPsDetailsItem;
