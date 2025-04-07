import type { FC } from 'react';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { NetworkDetailsItemProps } from './NetworkDetailsItemProps';

export const NameDetailsItem: FC<NetworkDetailsItemProps> = ({
  helpContent,
  moreInfoLink,
  resource,
}) => {
  const { t } = useForkliftTranslation();

  const defaultMoreInfoLink =
    'https://kubernetes.io/docs/concepts/overview/working-with-objects/names';
  const defaultHelpContent = t(
    'Name is primarily intended for creation idempotence and configuration definition. Cannot be updated.',
  );

  return (
    <DetailsItem
      title={t('Name')}
      content={resource?.metadata?.name}
      moreInfoLink={moreInfoLink ?? defaultMoreInfoLink}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['metadata', 'name']}
    />
  );
};
