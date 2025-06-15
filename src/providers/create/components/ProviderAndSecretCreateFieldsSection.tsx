import type { FC } from 'react';
import { validateOpenshiftURL } from 'src/modules/Providers/utils/validators/provider/openshift/validateOpenshiftURL';
import { validateOpenstackURL } from 'src/modules/Providers/utils/validators/provider/openstack/validateOpenstackURL';
import { validateOvaNfsPath } from 'src/modules/Providers/utils/validators/provider/ova/validateOvaNfsPath';
import { validateOvirtURL } from 'src/modules/Providers/utils/validators/provider/ovirt/validateOvirtURL';
import EsxiCredentialsEdit from 'src/providers/details/tabs/Credentials/components/EsxiCredentialsEdit';
import OpenshiftCredentialsEdit from 'src/providers/details/tabs/Credentials/components/OpenshiftCredentialsEdit';
import OpenstackCredentialsEdit from 'src/providers/details/tabs/Credentials/components/OpenstackCredentialsEdit';
import OvirtCredentialsEdit from 'src/providers/details/tabs/Credentials/components/OvirtCredentialsEdit';
import VCenterCredentialsEdit from 'src/providers/details/tabs/Credentials/components/VCenterCredentialsEdit';
import { PROVIDER_TYPES, VSphereEndpointType } from 'src/providers/utils/constants';

import SectionHeading from '@components/headers/SectionHeading';
import { getSdkEndpoint, getType } from '@utils/crds/common/selectors';

import { CREDENTIALS_TITLE } from '../utils/constants';
import type { ProvidersCreateFormsSectionProps } from '../utils/types';

import EsxiProviderEdit from './EsxiProviderEdit';
import ProviderUrlEditItem from './ProviderUrlEditItem';
import VCenterProviderEdit from './VCenterProviderEdit';

const ProviderAndSecretCreateFieldsSection: FC<ProvidersCreateFormsSectionProps> = ({
  newProvider,
  newSecret,
  onNewProviderChange,
  onNewSecretChange,
}) => {
  switch (getType(newProvider)) {
    case PROVIDER_TYPES.openstack:
      return (
        <>
          <ProviderUrlEditItem
            provider={newProvider}
            onChange={onNewProviderChange}
            urlValidator={validateOpenstackURL}
          />
          <SectionHeading text={CREDENTIALS_TITLE} className="forklift-create-provider-header" />
          <OpenstackCredentialsEdit secret={newSecret} onNewSecretChange={onNewSecretChange} />
        </>
      );
    case PROVIDER_TYPES.openshift:
      return (
        <>
          <ProviderUrlEditItem
            provider={newProvider}
            onChange={onNewProviderChange}
            urlValidator={validateOpenshiftURL}
            isRequired={false}
          />
          <SectionHeading text={CREDENTIALS_TITLE} className="forklift-create-provider-header" />
          <OpenshiftCredentialsEdit secret={newSecret} onNewSecretChange={onNewSecretChange} />
        </>
      );
    case PROVIDER_TYPES.ovirt:
      return (
        <>
          <ProviderUrlEditItem
            provider={newProvider}
            onChange={onNewProviderChange}
            urlValidator={validateOvirtURL}
          />
          <SectionHeading text={CREDENTIALS_TITLE} className="forklift-create-provider-header" />
          <OvirtCredentialsEdit secret={newSecret} onNewSecretChange={onNewSecretChange} />
        </>
      );
    case PROVIDER_TYPES.vsphere:
      switch (getSdkEndpoint(newProvider)) {
        case VSphereEndpointType.ESXi:
          return (
            <>
              <EsxiProviderEdit provider={newProvider} onChange={onNewProviderChange} />
              <SectionHeading
                text={CREDENTIALS_TITLE}
                className="forklift-create-provider-header"
              />
              <EsxiCredentialsEdit secret={newSecret} onNewSecretChange={onNewSecretChange} />
            </>
          );
        case undefined:
        default:
          return (
            <>
              <VCenterProviderEdit
                provider={newProvider}
                secret={newSecret}
                onChange={onNewProviderChange}
              />
              <SectionHeading
                text={CREDENTIALS_TITLE}
                className="forklift-create-provider-header"
              />
              <VCenterCredentialsEdit secret={newSecret} onNewSecretChange={onNewSecretChange} />
            </>
          );
      }
    case PROVIDER_TYPES.ova:
      return (
        <>
          <ProviderUrlEditItem
            provider={newProvider}
            onChange={onNewProviderChange}
            urlValidator={validateOvaNfsPath}
          />
        </>
      );
    case undefined:
    default:
      return <></>;
  }
};

export default ProviderAndSecretCreateFieldsSection;
