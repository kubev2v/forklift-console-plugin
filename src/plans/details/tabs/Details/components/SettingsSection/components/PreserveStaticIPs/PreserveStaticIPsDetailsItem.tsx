import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import type { EditPlanProps } from 'src/plans/details/tabs/Details/components/SettingsSection/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useModal } from '@openshift-console/dynamic-plugin-sdk';
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
  const launcher = useModal();

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
        launcher<EditPlanProps>(EditPlanPreserveStaticIPs, { resource: plan });
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default PreserveStaticIPsDetailsItem;
