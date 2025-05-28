import type { FC } from 'react';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Label } from '@patternfly/react-core';

import type { EditableDetailsItemProps } from '../../../utils/types';

import { getDiskRawCopy } from './utils/utils';
import EditRawDiskCopy from './EditRawDiskCopy';

const RawDiskCopyDetailsItem: FC<EditableDetailsItemProps> = ({ canPatch, plan, shouldRender }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  if (!shouldRender) return null;

  const skipGuestConversion = getDiskRawCopy(plan);

  return (
    <DetailsItem
      title={t('Raw copy mode')}
      content={
        <Label isCompact color="grey">
          {skipGuestConversion ? t('Use raw copy mode') : t('Use default')}
        </Label>
      }
      crumbs={['spec', 'skipGuestConversion']}
      onEdit={() => {
        showModal(<EditRawDiskCopy resource={plan} />);
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default RawDiskCopyDetailsItem;
