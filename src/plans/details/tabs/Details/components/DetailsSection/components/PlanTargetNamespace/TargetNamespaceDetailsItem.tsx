import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import type { EditPlanProps } from 'src/plans/details/tabs/Details/components/SettingsSection/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { getPlanTargetNamespace } from '@utils/crds/plans/selectors';

import { PROVIDER_DEFAULTS } from '../../../SettingsSection/components/PlanTransferNetwork/utils/constants';
import type { EditableDetailsItemProps } from '../../../utils/types';

import EditPlanTargetNamespace from './EditPlanTargetNamespace';

const TargetNamespaceDetailsItem: FC<EditableDetailsItemProps> = ({ canPatch, plan }) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  return (
    <DetailsItem
      testId="target-project-detail-item"
      title={t('Target project')}
      content={
        getPlanTargetNamespace(plan) ?? <span className="text-muted">{PROVIDER_DEFAULTS}</span>
      }
      helpContent={t(
        'Projects, also known as namespaces, separate resources within clusters. The target project is the project, within your selected target provider, that your virtual machines will be migrated to. This is different from the project that your migration plan will be created in and where your provider was created.',
      )}
      crumbs={['spec', 'targetNamespace']}
      onEdit={() => {
        launcher<EditPlanProps>(EditPlanTargetNamespace, { resource: plan });
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default TargetNamespaceDetailsItem;
