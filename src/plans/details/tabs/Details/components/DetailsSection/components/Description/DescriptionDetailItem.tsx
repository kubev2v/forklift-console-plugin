import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';

import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Truncate } from '@patternfly/react-core';
import { getPlanDescription } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../../SettingsSection/utils/types';
import type { EditableDetailsItemProps } from '../../../utils/types';

import EditPlanDescription from './EditPlanDescription';

const DescriptionDetailItem: FC<EditableDetailsItemProps> = ({ canPatch, plan }) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  const description = getPlanDescription(plan) ?? '';
  const content = isEmpty(description) ? t('None') : description;
  return (
    <DetailsItem
      testId="description-detail-item"
      title={t('Description')}
      content={<Truncate content={content} />}
      onEdit={() => {
        launcher<EditPlanProps>(EditPlanDescription, { resource: plan });
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default DescriptionDetailItem;
