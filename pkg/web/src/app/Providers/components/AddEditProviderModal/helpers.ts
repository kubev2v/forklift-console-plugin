import { useClusterProvidersQuery, useSecretQuery } from '@app/queries';
import * as React from 'react';
import { IProviderObject } from '@app/queries/types';
import { AddProviderFormState } from './AddEditProviderModal';
import { ovirtUrlToHostname, vmwareUrlToHostname } from '@app/client/helpers';

interface IEditProviderPrefillEffect {
  isDonePrefilling: boolean;
}

export const useAddEditProviderPrefillEffect = (
  forms: AddProviderFormState,
  providerBeingEdited: IProviderObject | null,
  namespace: string
): IEditProviderPrefillEffect => {
  const [isStartedPrefilling, setIsStartedPrefilling] = React.useState(false);
  const [isDonePrefilling, setIsDonePrefilling] = React.useState(false);
  const secretQuery = useSecretQuery(providerBeingEdited?.spec.secret?.name || null, namespace);
  const clusterProvidersQuery = useClusterProvidersQuery(namespace);
  const providerType = forms.vsphere.values.providerType || providerBeingEdited?.spec.type;
  React.useEffect(() => {
    if (
      !isStartedPrefilling &&
      (providerBeingEdited ? secretQuery.isSuccess : true) &&
      clusterProvidersQuery.isSuccess &&
      providerType
    ) {
      setIsStartedPrefilling(true);
      if (!providerBeingEdited) {
        if (providerType === 'vsphere') {
          const vmwareFields = forms.vsphere.fields;
          const vmwareProviders = (clusterProvidersQuery.data.items || []).filter(
            (provider) => provider.spec.type === 'vsphere'
          );
          if (vmwareProviders.length > 0) {
            const lastCreatedVmwareProvider = vmwareProviders.sort((a, b) =>
              (a.metadata.creationTimestamp || '') > (b.metadata.creationTimestamp || '') ? -1 : 1
            )[0];
            vmwareFields.vddkInitImage.prefill(
              lastCreatedVmwareProvider.spec.settings?.vddkInitImage || ''
            );
          }
        }
      } else {
        const secret = secretQuery.data;
        const { fields } = forms[providerType];
        fields.providerType.prefill(providerType);
        fields.name.prefill(providerBeingEdited.metadata.name);
        if (providerType === 'vsphere' || providerType === 'ovirt') {
          const sourceFields = fields as typeof forms.vsphere.fields | typeof forms.ovirt.fields;
          sourceFields.username.prefill(atob(secret?.data.user || ''));
          sourceFields.password.prefill(atob(secret?.data.password || ''));
        }
        if (providerType === 'ovirt') {
          const sourceFields = fields as typeof forms.ovirt.fields;
          sourceFields.caCert.prefill(atob(secret?.data.cacert || ''));
        }
        if (providerType === 'vsphere') {
          const vmwareFields = forms.vsphere.fields;
          vmwareFields.hostname.prefill(vmwareUrlToHostname(providerBeingEdited.spec.url || ''));
          vmwareFields.fingerprint.prefill(atob(secret?.data.thumbprint || ''));
          vmwareFields.vddkInitImage.prefill(
            providerBeingEdited.spec.settings?.vddkInitImage || ''
          );
        }
        if (providerType === 'ovirt') {
          const rhvFields = forms.ovirt.fields;
          rhvFields.hostname.prefill(ovirtUrlToHostname(providerBeingEdited.spec.url || ''));
        }
        if (providerType === 'openshift') {
          const openshiftFields = forms.openshift.fields;
          openshiftFields.url.prefill(providerBeingEdited.spec.url || '');
          openshiftFields.saToken.prefill(atob(secret?.data.token || ''));
        }
      }
      // Wait for effects to run based on field changes first
      window.setTimeout(() => {
        setIsDonePrefilling(true);
      }, 0);
    }
  }, [
    isStartedPrefilling,
    providerBeingEdited,
    secretQuery.data,
    secretQuery.isSuccess,
    clusterProvidersQuery.data,
    clusterProvidersQuery.isSuccess,
    forms,
    providerType,
  ]);
  return { isDonePrefilling };
};
