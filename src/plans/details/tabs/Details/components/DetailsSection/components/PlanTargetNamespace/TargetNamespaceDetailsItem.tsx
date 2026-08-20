import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import type { EditPlanProps } from 'src/plans/details/tabs/Details/components/SettingsSection/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';
import { getPlanTargetNamespace } from '@utils/crds/plans/selectors';

import { PROVIDER_DEFAULTS } from '../../../SettingsSection/components/PlanTransferNetwork/utils/constants';
import type { EditableDetailsItemProps } from '../../../utils/types';

import EditPlanTargetNamespace from './EditPlanTargetNamespace';

const TargetNamespaceDetailsItem: FC<EditableDetailsItemProps> = ({ canPatch, plan }) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();

  return (
    <DetailsItem
      canEdit={canPatch && isPlanEditable(plan)}
      content={
        getPlanTargetNamespace(plan) ?? (
          <Label color="grey" isCompact>
            {PROVIDER_DEFAULTS}
          </Label>
        )
      }
      crumbs={['spec', 'targetNamespace']}
      helpContent={t(
        'Projects, also known as namespaces, separate resources within clusters. The target project is the project, within your selected target provider, that your virtual machines will be migrated to. This is different from the project that your migration plan will be created in and where your provider was created.',
      )}
      onEdit={() => {
        launchOverlay<EditPlanProps>(EditPlanTargetNamespace, { resource: plan });
      }}
      testId="target-project-detail-item"
      title={t('Target project')}
    />
  );
};

export default TargetNamespaceDetailsItem;
