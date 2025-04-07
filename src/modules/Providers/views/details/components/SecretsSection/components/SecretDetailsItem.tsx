import type { FC, ReactNode } from 'react';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Provider } from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

type SecretDetailsItemProps = {
  resource: V1beta1Provider;
  moreInfoLink?: string;
  helpContent?: ReactNode;
};

export const SecretDetailsItem: FC<SecretDetailsItemProps> = ({
  helpContent,
  moreInfoLink,
  resource: provider,
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
            groupVersionKind={{ kind: 'Secret', version: 'v1' }}
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
