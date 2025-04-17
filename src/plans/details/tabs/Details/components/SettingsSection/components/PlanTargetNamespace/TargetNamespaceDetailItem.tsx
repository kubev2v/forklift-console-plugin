import type { FC } from 'react';
import { isPlanEditable } from 'src/modules/Plans/utils/helpers/getPlanPhase';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import { getPlanTargetNamespace } from '@utils/crds/plans/selectors';

import type { SettingsDetailsItemProps } from '../../utils/types';
import { PROVIDER_DEFAULTS } from '../PlanTransferNetwork/utils/constants';

import EditPlanTargetNamespace from './EditPlanTargetNamespace';

const TargetNamespaceDetailsItem: FC<SettingsDetailsItemProps> = ({ canPatch, plan }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  return (
    <DetailsItem
      title={t('Target namespace')}
      content={
        getPlanTargetNamespace(plan) ?? <span className="text-muted">{PROVIDER_DEFAULTS}</span>
      }
      helpContent={t('Target namespace.')}
      crumbs={['spec', 'targetNamespace ']}
      onEdit={() => {
        showModal(<EditPlanTargetNamespace resource={plan} />);
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default TargetNamespaceDetailsItem;
