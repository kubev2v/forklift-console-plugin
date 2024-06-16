import React from 'react';
import { useModal } from 'src/modules/Providers/modals';
import { DetailsItem } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import { PlanDetailsItemProps } from '../../DetailsSection';
import { EditLUKSEncryptionPasswords, VIRT_V2V_HELP_LINK } from '../modals';

export const SetLUKSEncryptionPasswordsDetailsItem: React.FC<PlanDetailsItemProps> = ({
  resource,
  canPatch,
  helpContent,
  destinationProvider,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();
  const luks = resource?.spec?.vms?.[0].luks;

  const defaultHelpContent = t(
    'Specify a list of passphrases for the Linux Unified Key Setup (LUKS)-encrypted devices for the VMs that you want to migrate.',
  );

  return (
    <DetailsItem
      title={t('Disk decryption passphrases')}
      content={
        luks ? (
          <span>
            <ResourceLink
              groupVersionKind={{ kind: 'Secret', version: 'v1' }}
              name={luks?.name}
              namespace={resource.metadata.namespace}
            />
          </span>
        ) : (
          <span className="text-muted">{t('No decryption keys defined')}</span>
        )
      }
      helpContent={helpContent ?? defaultHelpContent}
      moreInfoLink={VIRT_V2V_HELP_LINK}
      crumbs={['spec', 'vms', 'luks']}
      onEdit={
        canPatch &&
        (() =>
          showModal(
            <EditLUKSEncryptionPasswords
              resource={resource}
              destinationProvider={destinationProvider}
            />,
          ))
      }
    />
  );
};
