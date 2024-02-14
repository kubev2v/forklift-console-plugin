import React from 'react';
import { ModalHOC } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  OpenshiftCredentialsEdit,
  OpenstackCredentialsEdit,
  OvirtCredentialsEdit,
  VSphereCredentialsEdit,
} from '../../details';

import { EditProviderSectionHeading } from './EditProviderSectionHeading';
import { OpenshiftProviderFormCreate } from './OpenshiftProviderCreateForm';
import { OpenstackProviderCreateForm } from './OpenstackProviderCreateForm';
import { OVAProviderCreateForm } from './OVAProviderCreateForm';
import { OvirtProviderCreateForm } from './OvirtProviderCreateForm';
import { ProvidersCreateFormProps } from './ProviderCreateForm';
import { VSphereProviderCreateForm } from './VSphereProviderCreateForm';

export const EditProvider: React.FC<ProvidersCreateFormProps> = ({
  newProvider,
  newSecret,
  onNewProviderChange,
  onNewSecretChange,
}) => {
  const { t } = useForkliftTranslation();

  switch (newProvider?.spec?.type) {
    case 'openstack':
      return (
        <>
          <OpenstackProviderCreateForm provider={newProvider} onChange={onNewProviderChange} />

          <EditProviderSectionHeading text={t('Provider credentials')} />
          <OpenstackCredentialsEdit secret={newSecret} onChange={onNewSecretChange} />
        </>
      );
    case 'openshift':
      return (
        <>
          <OpenshiftProviderFormCreate provider={newProvider} onChange={onNewProviderChange} />

          <EditProviderSectionHeading text={t('Provider credentials')} />
          <OpenshiftCredentialsEdit secret={newSecret} onChange={onNewSecretChange} />
        </>
      );
    case 'ovirt':
      return (
        <>
          <OvirtProviderCreateForm provider={newProvider} onChange={onNewProviderChange} />

          <EditProviderSectionHeading text={t('Provider credentials')} />
          <OvirtCredentialsEdit secret={newSecret} onChange={onNewSecretChange} />
        </>
      );
    case 'vsphere':
      return (
        <ModalHOC>
          <VSphereProviderCreateForm provider={newProvider} onChange={onNewProviderChange} />

          <EditProviderSectionHeading text={t('Provider credentials')} />
          <VSphereCredentialsEdit
            secret={newSecret}
            url={newProvider?.spec?.url}
            onChange={onNewSecretChange}
          />
        </ModalHOC>
      );
    case 'ova':
      return (
        <>
          <OVAProviderCreateForm provider={newProvider} onChange={onNewProviderChange} />
        </>
      );
    default:
      return <></>;
  }
};
