import type { FC } from 'react';
import { ConsoleTimestamp } from 'src/components/ConsoleTimestamp/ConsoleTimestamp';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { ProviderDetailsItemProps } from './ProviderDetailsItem';

export const CreatedAtDetailsItem: FC<ProviderDetailsItemProps> = ({
  helpContent,
  moreInfoLink,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();

  const defaultMoreInfoLink = 'https://kubernetes.io/docs/reference/using-api/api-concepts';
  const defaultHelpContent = t(
    `CreationTimestamp is a timestamp representing the server time when this object was created.
    It is not guaranteed to be set in happens-before order across separate operations.
    Clients may not set this value. It is represented in RFC3339 form and is in UTC.`,
  );

  return (
    <DetailsItem
      title={t('Created at')}
      content={<ConsoleTimestamp timestamp={provider?.metadata?.creationTimestamp} />}
      moreInfoLink={moreInfoLink ?? defaultMoreInfoLink}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['Provider', 'metadata', 'creationTimestamp']}
    />
  );
};
