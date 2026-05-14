import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import type { EditPlanProps } from 'src/plans/details/tabs/Details/components/SettingsSection/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';

import type { EditableDetailsItemProps } from '../../../utils/types';

import { getPlanXfsCompatibility } from './utils/utils';
import EditPlanXfsCompatibility from './EditPlanXfsCompatibility';

const XfsCompatibilityDetailsItem: FC<EditableDetailsItemProps> = ({
  canPatch,
  plan,
  shouldRender,
}) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  if (!shouldRender) return null;

  const xfsCompatibility = getPlanXfsCompatibility(plan);

  return (
    <DetailsItem
      title={t('XFS v4 compatibility')}
      content={
        <Label isCompact color="grey">
          {xfsCompatibility ? t('Enabled') : t('Disabled')}
        </Label>
      }
      helpContent={t(
        'XFS v4 and BTRFS support are mutually exclusive. Enable for XFS v4 filesystems; leave disabled for BTRFS.',
      )}
      crumbs={['spec', 'xfsCompatibility']}
      onEdit={() => {
        launcher<EditPlanProps>(EditPlanXfsCompatibility, { resource: plan });
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default XfsCompatibilityDetailsItem;
