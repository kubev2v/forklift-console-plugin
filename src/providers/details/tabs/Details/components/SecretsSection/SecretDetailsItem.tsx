import type { FC, ReactNode } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Provider } from '@forklift-ui/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { MORE_INFO_SECRET_DETAIL_ITEM } from '@utils/links';

type SecretDetailsItemProps = {
  helpContent?: ReactNode;
  moreInfoLink?: string;
  resource: V1beta1Provider | undefined;
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
      crumbs={['Provider', 'spec', 'secret']}
      helpContent={helpContent ?? defaultHelpContent}
      moreInfoLink={moreInfoLink ?? MORE_INFO_SECRET_DETAIL_ITEM}
      title={t('Secret')}
    />
  );
};
