import type { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModelRef } from '@kubev2v/types';

import type { ProviderDetailsItemProps } from './ProviderDetailsItem';

export const CredentialsDetailsItem: FC<ProviderDetailsItemProps> = ({
  helpContent,
  moreInfoLink,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();

  const providerURL = getResourceUrl({
    name: provider?.metadata?.name,
    namespace: provider?.metadata?.namespace,
    reference: ProviderModelRef,
  });

  const defaultHelpContent = t(
    `Edit provider credentials.
    Use this link to edit the providers credentials instead of editing the secret directly.`,
  );

  return (
    <DetailsItem
      data-testid="credentials-detail-item"
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
