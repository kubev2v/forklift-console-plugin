import type { FC } from 'react';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import type { StorageDetailsItemProps } from './StorageDetailsItemProps';

export const NamespaceDetailsItem: FC<StorageDetailsItemProps> = ({
  helpContent,
  moreInfoLink,
  resource,
}) => {
  const { t } = useForkliftTranslation();

  const defaultMoreInfoLink =
    'https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces';
  const defaultHelpContent = t(
    `Namespace defines the space within which each name must be unique.
     An empty namespace is equivalent to the "default" namespace, but "default" is the canonical representation.
     Not all objects are required to be scoped to a namespace -
     the value of this field for those objects will be empty.`,
  );

  return (
    <DetailsItem
      title={t('Namespace')}
      content={
        <ResourceLink
          groupVersionKind={{ kind: 'Namespace', version: 'v1' }}
          name={resource?.metadata?.namespace}
          namespace={resource?.metadata?.namespace}
        />
      }
      moreInfoLink={moreInfoLink ?? defaultMoreInfoLink}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['metadata', 'namespace']}
    />
  );
};
