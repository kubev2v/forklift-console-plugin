import type { FC } from 'react';

import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { otherFormFieldLabels, OtherSettingsFormFieldId } from '../other-settings/constants';

type VsphereOtherSettingsReviewItemsProps = {
  nbdeClevis?: boolean;
  offloadPopulatorPriorityClassName?: string;
  preserveStaticIps?: boolean;
  rootDevice?: string;
  sharedDisks?: boolean;
  showOffloadPriorityClass: boolean;
};

const VsphereOtherSettingsReviewItems: FC<VsphereOtherSettingsReviewItemsProps> = ({
  nbdeClevis,
  offloadPopulatorPriorityClassName,
  preserveStaticIps,
  rootDevice,
  sharedDisks,
  showOffloadPriorityClass,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Use NBDE/Clevis')}</DescriptionListTerm>
        <DescriptionListDescription data-testid="review-nbde-clevis">
          {nbdeClevis ? t('Enabled') : t('Disabled')}
        </DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTerm>
          {otherFormFieldLabels[OtherSettingsFormFieldId.PreserveStaticIps]}
        </DescriptionListTerm>
        <DescriptionListDescription data-testid="review-preserve-static-ips">
          {preserveStaticIps ? t('Enabled') : t('Disabled')}
        </DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTerm>
          {otherFormFieldLabels[OtherSettingsFormFieldId.RootDevice]}
        </DescriptionListTerm>
        <DescriptionListDescription data-testid="review-root-device">
          {rootDevice ?? t('First root device')}
        </DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTerm>
          {otherFormFieldLabels[OtherSettingsFormFieldId.MigrateSharedDisks]}
        </DescriptionListTerm>
        <DescriptionListDescription data-testid="review-shared-disks">
          {sharedDisks ? t('Enabled') : t('Disabled')}
        </DescriptionListDescription>
      </DescriptionListGroup>

      {showOffloadPriorityClass && (
        <DescriptionListGroup>
          <DescriptionListTerm>
            {otherFormFieldLabels[OtherSettingsFormFieldId.OffloadPopulatorPriorityClassName]}
          </DescriptionListTerm>
          <DescriptionListDescription data-testid="review-offload-populator-priority-class">
            {isEmpty(offloadPopulatorPriorityClassName)
              ? t('Cluster default')
              : offloadPopulatorPriorityClassName}
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
    </>
  );
};

export default VsphereOtherSettingsReviewItems;
