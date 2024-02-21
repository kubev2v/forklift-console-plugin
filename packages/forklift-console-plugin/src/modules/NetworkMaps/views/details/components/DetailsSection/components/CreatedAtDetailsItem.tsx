import React from 'react';
import { DetailsItem } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Timestamp } from '@openshift-console/dynamic-plugin-sdk';

import { NetworkDetailsItemProps } from './NetworkDetailsItemProps';

export const CreatedAtDetailsItem: React.FC<NetworkDetailsItemProps> = ({
  resource,
  moreInfoLink,
  helpContent,
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
      content={<Timestamp timestamp={resource?.metadata?.creationTimestamp} />}
      moreInfoLink={moreInfoLink ?? defaultMoreInfoLink}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['metadata', 'creationTimestamp']}
    />
  );
};
