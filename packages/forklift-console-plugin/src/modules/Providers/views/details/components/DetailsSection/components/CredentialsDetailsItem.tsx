import React from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModelRef } from '@kubev2v/types';

import { DetailsItem, getResourceUrl } from '../../../../../utils';

import { ProviderDetailsItemProps } from './ProviderDetailsItem';

export const CredentialsDetailsItem: React.FC<ProviderDetailsItemProps> = ({
  resource: provider,
  moreInfoLink,
  helpContent,
}) => {
  const { t } = useForkliftTranslation();

  const providerURL = getResourceUrl({
    reference: ProviderModelRef,
    name: provider?.metadata?.name,
    namespace: provider?.metadata?.namespace,
  });

  const defaultHelpContent = t(
    `Edit provider credentials.
    Use this link to edit the providers credentials instead of editing the secret directly.`,
  );

  return (
    <DetailsItem
      title={t('Credentials')}
      content={
        provider?.spec?.secret.name ? (
          <Link to={`${providerURL}/credentials`}>{t('Provider credentials')}</Link>
        ) : (
          <span className="text-muted">{t('No secret')}</span>
        )
      }
      moreInfoLink={moreInfoLink}
      helpContent={helpContent ?? defaultHelpContent}
    />
  );
};
