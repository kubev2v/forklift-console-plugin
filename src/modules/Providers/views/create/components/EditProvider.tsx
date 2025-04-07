import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { EsxiCredentialsEdit } from '../../details/components/CredentialsSection/components/edit/EsxiCredentialsEdit';
import { OpenshiftCredentialsEdit } from '../../details/components/CredentialsSection/components/edit/OpenshiftCredentialsEdit';
import { OpenstackCredentialsEdit } from '../../details/components/CredentialsSection/components/edit/OpenstackCredentialsEdit';
import { OvirtCredentialsEdit } from '../../details/components/CredentialsSection/components/edit/OvirtCredentialsEdit';
import { VCenterCredentialsEdit } from '../../details/components/CredentialsSection/components/edit/VCenterCredentialsEdit';

import { EditProviderSectionHeading } from './EditProviderSectionHeading';
import { EsxiProviderCreateForm } from './EsxiProviderCreateForm';
import { OpenshiftProviderFormCreate } from './OpenshiftProviderCreateForm';
import { OpenstackProviderCreateForm } from './OpenstackProviderCreateForm';
import { OVAProviderCreateForm } from './OVAProviderCreateForm';
import { OvirtProviderCreateForm } from './OvirtProviderCreateForm';
import type { ProvidersCreateFormProps } from './ProviderCreateForm';
import { VCenterProviderCreateForm } from './VCenterProviderCreateForm';

export const EditProvider: FC<ProvidersCreateFormProps> = ({
  newProvider,
  newSecret,
  onNewProviderChange,
  onNewSecretChange,
}) => {
  const { t } = useForkliftTranslation();

  const type = newProvider?.spec?.type || '';
  const subType = newProvider?.spec?.settings?.sdkEndpoint || '';

  switch (type) {
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
      switch (subType) {
        case 'esxi':
          return (
            <>
              <EsxiProviderCreateForm provider={newProvider} onChange={onNewProviderChange} />

              <EditProviderSectionHeading text={t('Provider credentials')} />
              <EsxiCredentialsEdit secret={newSecret} onChange={onNewSecretChange} />
            </>
          );
        default:
          return (
            <>
              <VCenterProviderCreateForm
                provider={newProvider}
                secret={newSecret}
                onChange={onNewProviderChange}
              />

              <EditProviderSectionHeading text={t('Provider credentials')} />
              <VCenterCredentialsEdit secret={newSecret} onChange={onNewSecretChange} />
            </>
          );
      }
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
