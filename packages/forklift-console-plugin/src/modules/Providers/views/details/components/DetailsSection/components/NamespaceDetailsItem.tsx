import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import { DetailsItem } from '../../../../../utils';

import { ProviderDetailsItemProps } from './ProviderDetailsItem';

export const NamespaceDetailsItem: React.FC<ProviderDetailsItemProps> = ({
  resource: provider,
  moreInfoLink,
  helpContent,
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
          groupVersionKind={{ version: 'v1', kind: 'Namespace' }}
          name={provider?.metadata?.namespace}
          namespace={provider?.metadata?.namespace}
        />
      }
      moreInfoLink={moreInfoLink ?? defaultMoreInfoLink}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['Provider', 'metadata', 'namespace']}
    />
  );
};
