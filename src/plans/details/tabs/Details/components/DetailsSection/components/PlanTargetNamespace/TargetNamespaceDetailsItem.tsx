import type { FC } from 'react';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { getPlanTargetNamespace } from '@utils/crds/plans/selectors';

import { PROVIDER_DEFAULTS } from '../../../SettingsSection/components/PlanTransferNetwork/utils/constants';
import type { EditableDetailsItemProps } from '../../../utils/types';

import EditPlanTargetNamespace from './EditPlanTargetNamespace';

const TargetNamespaceDetailsItem: FC<EditableDetailsItemProps> = ({ canPatch, plan }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  return (
    <DetailsItem
      title={t('Target project')}
      content={
        getPlanTargetNamespace(plan) ?? <span className="text-muted">{PROVIDER_DEFAULTS}</span>
      }
      helpContent={t(
        'Projects, also known as namespaces, separate resources within clusters. The target project is the project, within your selected target provider, that your virtual machines will be migrated to. This is different from the project that your migration plan will be created in and where your provider was created.',
      )}
      crumbs={['spec', 'targetNamespace']}
      onEdit={() => {
        showModal(<EditPlanTargetNamespace resource={plan} />);
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default TargetNamespaceDetailsItem;
