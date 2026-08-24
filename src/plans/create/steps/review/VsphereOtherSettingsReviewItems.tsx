import type { FC } from 'react';

import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { otherFormFieldLabels, OtherSettingsFormFieldId } from '../other-settings/constants';

type VsphereOtherSettingsReviewItemsProps = {
  nbdeClevis?: boolean;
  preserveStaticIps?: boolean;
  rootDevice?: string;
  sharedDisks?: boolean;
};

const VsphereOtherSettingsReviewItems: FC<VsphereOtherSettingsReviewItemsProps> = ({
  nbdeClevis,
  preserveStaticIps,
  rootDevice,
  sharedDisks,
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
    </>
  );
};

export default VsphereOtherSettingsReviewItems;
