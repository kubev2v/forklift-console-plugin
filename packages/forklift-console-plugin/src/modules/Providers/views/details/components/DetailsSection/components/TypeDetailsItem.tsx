import React from 'react';
import { PROVIDERS } from 'src/utils/enums';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Label } from '@patternfly/react-core';

import { DetailsItem } from '../../../../../utils';

import { ProviderDetailsItemProps } from './ProviderDetailsItem';

export const TypeDetailsItem: React.FC<ProviderDetailsItemProps> = ({
  resource: provider,
  moreInfoLink,
  helpContent,
}) => {
  const { t } = useForkliftTranslation();

  const type = PROVIDERS[provider?.spec?.type] || provider?.spec?.type;

  const defaultMoreInfoLink =
    'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.8/html-single/installing_and_using_the_migration_toolkit_for_virtualization/index#adding-providers';
  const defaultHelpContent = t(
    `Specify the type of source provider. Allowed values are ova, ovirt, vsphere,
      openshift, and openstack. This label is needed to verify the credentials are correct when the remote system is accessible and, for RHV, to retrieve the Manager CA certificate when
      a third-party certificate is specified.`,
  );

  return (
    <DetailsItem
      title={t('Type')}
      content={
        <>
          {type}{' '}
          {!provider?.spec?.url && (
            <Label isCompact color={'grey'} className="forklift-table__flex-cell-label">
              {t('Host cluster')}
            </Label>
          )}
          {provider?.spec?.type === 'vsphere' &&
            (provider?.spec?.settings?.['sdkEndpoint'] === 'esxi' ? (
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
