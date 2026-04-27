import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import { useCreateProviderFormContext } from '../../hooks/useCreateProviderFormContext';
import { ProviderFormFieldId } from '../constants';

export const useUrlByProviderType = (): string => {
  const { watch } = useCreateProviderFormContext();

  const [openshiftUrl, openstackUrl, ovirtUrl, vsphereUrl, providerType] = watch([
    ProviderFormFieldId.OpenshiftUrl,
    ProviderFormFieldId.OpenstackUrl,
    ProviderFormFieldId.OvirtUrl,
    ProviderFormFieldId.VsphereUrl,
    ProviderFormFieldId.ProviderType,
  ]);

  if (providerType === PROVIDER_TYPES.openshift) {
    return openshiftUrl ?? '';
  }
  if (providerType === PROVIDER_TYPES.openstack) {
    return openstackUrl ?? '';
  }
  if (providerType === PROVIDER_TYPES.ovirt) {
    return ovirtUrl ?? '';
  }
  if (providerType === PROVIDER_TYPES.vsphere) {
    return (vsphereUrl as string) ?? '';
  }

  return '';
};
