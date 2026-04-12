import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import { useCreateProviderFormContext } from '../../hooks/useCreateProviderFormContext';
import { ProviderFormFieldId } from '../constants';

/** WinRM over HTTPS default port */
const WIN_RM_PORT = 5986;

export const useUrlByProviderType = (): string => {
  const { watch } = useCreateProviderFormContext();

  const [openshiftUrl, openstackUrl, ovirtUrl, vsphereUrl, hypervHost, providerType] = watch([
    ProviderFormFieldId.OpenshiftUrl,
    ProviderFormFieldId.OpenstackUrl,
    ProviderFormFieldId.OvirtUrl,
    ProviderFormFieldId.VsphereUrl,
    ProviderFormFieldId.HypervHost,
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
  if (providerType === PROVIDER_TYPES.hyperv) {
    const host = (hypervHost as string)?.trim();
    return host ? `https://${host}:${WIN_RM_PORT}` : '';
  }

  return '';
};
