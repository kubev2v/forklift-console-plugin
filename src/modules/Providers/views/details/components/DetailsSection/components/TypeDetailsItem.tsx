import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { PROVIDERS } from 'src/utils/enums';
import { useForkliftTranslation } from 'src/utils/i18n';
import { isProviderLocalOpenshift } from 'src/utils/resources';

import type { ProviderType } from '@kubev2v/types';
import { Label } from '@patternfly/react-core';

import type { ProviderDetailsItemProps } from './ProviderDetailsItem';

export const TypeDetailsItem: FC<ProviderDetailsItemProps> = ({
  helpContent,
  moreInfoLink,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();
  const providerType = provider?.spec?.type as ProviderType;
  const type = PROVIDERS[providerType];

  const defaultMoreInfoLink =
    'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.9/html/installing_and_using_the_migration_toolkit_for_virtualization/migrating-virt_cnv#adding-source-provider_cnv';
  const defaultHelpContent = t(
    `Specify the type of source provider. Allowed values are ova, ovirt, vsphere,
      openshift, and openstack. This label is needed to verify the credentials are correct when the remote system is accessible and, for RHV, to retrieve the Manager CA certificate when
      a third-party certificate is specified.`,
  );

  return (
    <DetailsItem
      testId="type-detail-item"
      title={t('Type')}
      content={
        <>
          {type}{' '}
          {isProviderLocalOpenshift(provider) && (
            <Label isCompact color={'grey'} className="forklift-table__flex-cell-label">
              {t('Host cluster')}
            </Label>
          )}
          {provider?.spec?.type === 'vsphere' &&
            (provider?.spec?.settings?.sdkEndpoint === 'esxi' ? (
              <Label isCompact color={'grey'} className="forklift-table__flex-cell-label">
                {t('ESXi')}
              </Label>
            ) : (
              <Label isCompact color={'grey'} className="forklift-table__flex-cell-label">
                {t('vCenter')}
              </Label>
            ))}
        </>
      }
      moreInfoLink={moreInfoLink ?? defaultMoreInfoLink}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['Provider', 'spec', 'type']}
    />
  );
};
