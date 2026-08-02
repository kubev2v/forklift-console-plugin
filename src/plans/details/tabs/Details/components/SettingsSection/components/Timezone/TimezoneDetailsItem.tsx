import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';
import { getPlanTimezone } from '@utils/crds/plans/selectors';

import type { EditableDetailsItemProps } from '../../../utils/types';
import type { EditPlanProps } from '../../utils/types';

import EditTimezone from './EditTimezone';

const TimezoneDetailsItem: FC<EditableDetailsItemProps> = ({ canPatch, plan }) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();
  const timezone = getPlanTimezone(plan);

  return (
    <DetailsItem
      testId="timezone-detail-item"
      title={t('VM timezone')}
      content={
        <Label isCompact color="grey">
          {timezone || t('Source provider default')}
        </Label>
      }
      helpContent={t(
        'The IANA timezone set on migrated VMs. When set, overrides any timezone from the source provider.',
      )}
      crumbs={['spec', 'timezone']}
      onEdit={() => {
        launcher<EditPlanProps>(EditTimezone, { resource: plan });
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default TimezoneDetailsItem;
