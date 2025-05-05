import type { FC, ReactNode } from 'react';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Provider } from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { MORE_INFO_SECRET_DETAIL_ITEM } from '@utils/links';

type SecretDetailsItemProps = {
  resource: V1beta1Provider | undefined;
  moreInfoLink?: string;
  helpContent?: ReactNode;
};

export const SecretDetailsItem: FC<SecretDetailsItemProps> = ({
  helpContent,
  moreInfoLink,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();

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
      moreInfoLink={moreInfoLink ?? MORE_INFO_SECRET_DETAIL_ITEM}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['Provider', 'spec', 'secret']}
    />
  );
};
