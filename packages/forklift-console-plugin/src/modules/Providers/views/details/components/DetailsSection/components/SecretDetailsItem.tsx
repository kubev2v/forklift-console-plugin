import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import { DetailsItem } from '../../../../../utils';

import { ProviderDetailsItemProps } from './ProviderDetailsItem';

export const SecretDetailsItem: React.FC<ProviderDetailsItemProps> = ({
  resource: provider,
  moreInfoLink,
  helpContent,
}) => {
  const { t } = useForkliftTranslation();

  const defaultMoreInfoLink = 'https://kubernetes.io/docs/concepts/configuration/secret/';
  const defaultHelpContent = t(
    `A Secret containing credentials and other confidential information.`,
  );

  return (
    <DetailsItem
      title={t('Secret')}
      content={
        provider?.spec?.secret.name ? (
          <ResourceLink
            groupVersionKind={{ version: 'v1', kind: 'Secret' }}
            name={provider?.spec?.secret.name}
            namespace={provider?.spec?.secret.namespace}
          />
        ) : (
          <span className="text-muted">{t('No secret')}</span>
        )
      }
      moreInfoLink={moreInfoLink ?? defaultMoreInfoLink}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['Provider', 'spec', 'secret']}
    />
  );
};
