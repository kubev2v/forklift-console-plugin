import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import {
  EditProviderDefaultTransferNetwork,
  type EditProviderDefaultTransferNetworkProps,
} from 'src/modules/Providers/modals/EditProviderDefaultTransferNetwork/EditProviderDefaultTransferNetwork';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';
import { DEFAULT_NETWORK } from '@utils/constants';

import type { ProviderDetailsItemProps } from './ProviderDetailsItem';

export const TransferNetworkDetailsItem: FC<ProviderDetailsItemProps> = ({
  canPatch,
  helpContent,
  moreInfoLink,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  const defaultMoreInfoLink =
    'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.9/html/installing_and_using_the_migration_toolkit_for_virtualization/migrating-virt_cnv#selecting-migration-network-for-virt-provider_dest_cnv';
  const defaultHelpContent = t(
    `You can select a default migration network for an OpenShift Virtualization provider in the
    Red Hat OpenShift web console to improve performance. The default migration network is used to
    transfer disks to the namespaces in which it is configured.If you do not select a migration network,
    the default migration network is the pod network, which might not be optimal for disk transfer.`,
  );

  return (
    <DetailsItem
      testId="transfer-network-detail-item"
      title={t('Default transfer network')}
      content={
        provider?.metadata?.annotations?.['forklift.konveyor.io/defaultTransferNetwork'] ?? (
          <Label isCompact color="grey">
            {DEFAULT_NETWORK}
          </Label>
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
      onEdit={() => {
        launcher<EditProviderDefaultTransferNetworkProps>(EditProviderDefaultTransferNetwork, {
          resource: provider,
        });
      }}
      canEdit={canPatch}
    />
  );
};
