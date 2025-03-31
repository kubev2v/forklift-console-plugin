import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import { DetailsItem } from '../../../../../utils';

import type { ProviderDetailsItemProps } from './ProviderDetailsItem';

export const NamespaceDetailsItem: React.FC<ProviderDetailsItemProps> = ({
  helpContent,
  moreInfoLink,
  resource: provider,
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
