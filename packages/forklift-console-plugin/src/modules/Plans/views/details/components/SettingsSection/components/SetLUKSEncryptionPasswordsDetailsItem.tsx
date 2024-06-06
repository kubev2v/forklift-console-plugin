import React from 'react';
import { useModal } from 'src/modules/Providers/modals';
import { DetailsItem } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import { PlanDetailsItemProps } from '../../DetailsSection';
import { EditLUKSEncryptionPasswords } from '../modals';

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
    `Specify a list of keys for LUKS encrypted devices in order to convert the VM.`,
  );

  return (
    <DetailsItem
      title={t('Disk decryption keys')}
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
