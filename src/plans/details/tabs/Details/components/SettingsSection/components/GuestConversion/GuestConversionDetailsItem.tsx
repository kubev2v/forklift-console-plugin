import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Label, Stack, StackItem } from '@patternfly/react-core';

import type { EditableDetailsItemProps } from '../../../utils/types';

import { getSkipGuestConversion, getUseCompatibilityMode } from './utils/utils';
import GuestConversionEditModal from './GuestConversionEditModal';

const GuestConversionDetailsItem: FC<EditableDetailsItemProps> = ({
  canPatch,
  plan,
  shouldRender,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  if (!shouldRender) return null;

  const skipGuestConversion = getSkipGuestConversion(plan);
  const useCompatibilityMode = getUseCompatibilityMode(plan) ?? true;

  return (
    <DetailsItem
      testId="guest-conversion-mode-detail-item"
      title={t('Guest conversion mode')}
      content={
        <Stack>
          <StackItem>
            <Label isCompact>
              {skipGuestConversion ? t('Skip guest conversion') : t('Include guest conversion')}
            </Label>
          </StackItem>

          {skipGuestConversion && (
            <StackItem>
              <Label isCompact>
                {useCompatibilityMode
                  ? t('Compatibility mode enabled')
                  : t('Compatibility mode disabled')}
              </Label>
            </StackItem>
          )}
        </Stack>
      }
      crumbs={['spec', 'skipGuestConversion']}
      onEdit={() => {
        showModal(<GuestConversionEditModal resource={plan} />);
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default GuestConversionDetailsItem;
