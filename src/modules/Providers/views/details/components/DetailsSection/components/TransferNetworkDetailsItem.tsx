import type { FC } from 'react';
import { EditProviderDefaultTransferNetwork } from 'src/modules/Providers/modals/EditProviderDefaultTransferNetwork/EditProviderDefaultTransferNetwork';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { ProviderDetailsItemProps } from './ProviderDetailsItem';

export const TransferNetworkDetailsItem: FC<ProviderDetailsItemProps> = ({
  canPatch,
  helpContent,
  moreInfoLink,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const defaultMoreInfoLink =
    'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.8/html/installing_and_using_the_migration_toolkit_for_virtualization/migrating-virt_cnv#selecting-migration-network-for-virt-provider_dest_cnv';
  const defaultHelpContent = t(
    `You can select a default migration network for an OpenShift Virtualization provider in the
    Red Hat OpenShift web console to improve performance. The default migration network is used to
    transfer disks to the namespaces in which it is configured.If you do not select a migration network,
    the default migration network is the pod network, which might not be optimal for disk transfer.`,
  );

  return (
    <DetailsItem
      title={t('Default Transfer Network')}
      content={
        provider?.metadata?.annotations?.['forklift.konveyor.io/defaultTransferNetwork'] || (
          <span className="text-muted">{t('Pod network')}</span>
        )
      }
      moreInfoLink={moreInfoLink ?? defaultMoreInfoLink}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={[
        'Provider',
        'metadata',
        'annotations',
        'forklift.konveyor.io/defaultTransferNetwork',
      ]}
      onEdit={
        canPatch &&
        (() => {
          showModal(<EditProviderDefaultTransferNetwork resource={provider} />);
        })
      }
    />
  );
};
