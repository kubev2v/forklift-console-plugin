import React from 'react';
import { EditProviderURLModal, useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { IoK8sApiCoreV1Secret } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { DetailsItem } from '../../../../../utils';

import type { ProviderDetailsItemProps } from './ProviderDetailsItem';

export const URLDetailsItem: React.FC<ProviderDetailsItemProps> = ({
  canPatch,
  helpContent,
  moreInfoLink,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const [secret] = useK8sWatchResource<IoK8sApiCoreV1Secret>({
    groupVersionKind: { kind: 'Secret', version: 'v1' },
    name: provider?.spec?.secret?.name,
    namespace: provider?.spec?.secret?.namespace,
    namespaced: true,
  });

  const defaultMoreInfoLink =
    'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.7/html-single/installing_and_using_the_migration_toolkit_for_virtualization/index#adding-source-providers';
  const defaultHelpContent =
    t(`URL of the providers API endpoint. The URL must be a valid endpoint for the provider type, see
      the documentation for each provider type to learn more about the URL format.`);

  return (
    <DetailsItem
      title={t('URL')}
      content={provider?.spec?.url || <span className="text-muted">{t('Empty')}</span>}
      moreInfoLink={moreInfoLink ?? defaultMoreInfoLink}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['Provider', 'spec', 'url']}
      onEdit={
        canPatch &&
        provider?.spec?.url &&
        (() => {
          showModal(
            <EditProviderURLModal
              resource={provider}
              insecureSkipVerify={secret?.data?.insecureSkipVerify}
            />,
          );
        })
      }
    />
  );
};
