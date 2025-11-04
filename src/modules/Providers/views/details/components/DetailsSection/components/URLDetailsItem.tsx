import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import {
  EditProviderURLModal,
  type EditProviderURLModalProps,
} from 'src/modules/Providers/modals/EditProviderURL/EditProviderURLModal';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { IoK8sApiCoreV1Secret } from '@kubev2v/types';
import { useK8sWatchResource, useModal } from '@openshift-console/dynamic-plugin-sdk';

import type { ProviderDetailsItemProps } from './ProviderDetailsItem';

export const URLDetailsItem: FC<ProviderDetailsItemProps> = ({
  canPatch,
  helpContent,
  moreInfoLink,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  const [secret] = useK8sWatchResource<IoK8sApiCoreV1Secret>({
    groupVersionKind: { kind: 'Secret', version: 'v1' },
    name: provider?.spec?.secret?.name,
    namespace: provider?.spec?.secret?.namespace,
    namespaced: true,
  });

  const defaultMoreInfoLink =
    'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.10/html-single/planning_your_migration_to_red_hat_openshift_virtualization/index#adding-source-provider_cnv';
  const defaultHelpContent =
    t(`URL of the providers API endpoint. The URL must be a valid endpoint for the provider type, see
      the documentation for each provider type to learn more about the URL format.`);

  const url = provider?.spec?.url;
  const isEmpty = url === undefined || url === '';

  return (
    <DetailsItem
      testId="url-detail-item"
      title={t('URL')}
      content={isEmpty ? <span className="text-muted">{t('Empty')}</span> : url}
      moreInfoLink={moreInfoLink ?? defaultMoreInfoLink}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['Provider', 'spec', 'url']}
      onEdit={() => {
        launcher<EditProviderURLModalProps>(EditProviderURLModal, {
          insecureSkipVerify: secret?.data?.insecureSkipVerify,
          resource: provider,
        });
      }}
      canEdit={Boolean(provider?.spec?.url) && canPatch}
    />
  );
};
