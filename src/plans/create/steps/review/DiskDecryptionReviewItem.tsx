import type { FC } from 'react';

import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import {
  DiskDecryptionType,
  type DiskPassPhrase,
  otherFormFieldLabels,
  OtherSettingsFormFieldId,
} from '../other-settings/constants';

type DiskDecryptionReviewItemProps = {
  diskDecryptionType: DiskDecryptionType;
  diskPassPhrases: DiskPassPhrase[];
  existingLUKSSecret: { metadata?: { name?: string } } | undefined;
  nbdeClevis: boolean;
};

const DiskDecryptionReviewItem: FC<DiskDecryptionReviewItemProps> = ({
  diskDecryptionType,
  diskPassPhrases,
  existingLUKSSecret,
  nbdeClevis,
}) => {
  const { t } = useForkliftTranslation();

  if (nbdeClevis) return null;

  if (diskDecryptionType === DiskDecryptionType.Existing) {
    return (
      <DescriptionListGroup>
        <DescriptionListTerm>
          {otherFormFieldLabels[OtherSettingsFormFieldId.ExistingLUKSSecret]}
        </DescriptionListTerm>

        <DescriptionListDescription data-testid="review-existing-luks-secret">
          {existingLUKSSecret?.metadata?.name ?? t('None')}
        </DescriptionListDescription>
      </DescriptionListGroup>
    );
  }

  const passphraseCount = diskPassPhrases.filter((dp) => dp.value).length;

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>
        {otherFormFieldLabels[OtherSettingsFormFieldId.DiskDecryptionPassPhrases]}
      </DescriptionListTerm>

      <DescriptionListDescription data-testid="review-disk-decryption-passphrases">
        {passphraseCount === 0
          ? t('None')
          : t('{{count}} passphrase configured', { count: passphraseCount })}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default DiskDecryptionReviewItem;
