import { useClusterProvidersQuery, useSecretQuery } from 'legacy/src/queries';
import * as React from 'react';
import { IProviderObject } from 'legacy/src/queries/types';
import { AddProviderFormState } from './AddEditProviderModal';
import { ovirtUrlToHostname, vmwareUrlToHostname } from 'legacy/src/client/helpers';
import { stringToBoolean } from 'legacy/src/common/helpers';

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
          // For a new provider, prefill the vddkInitImage from the most recently created vmware provider
          const lastCreatedVmwareProvider = (clusterProvidersQuery.data.items || [])
            .filter((provider) => provider.spec.type === 'vsphere')
            .sort((a, b) =>
              (a.metadata.creationTimestamp || '') > (b.metadata.creationTimestamp || '') ? -1 : 1
            )
            .shift();

          const vmwareFields = forms.vsphere.fields;
          vmwareFields.vddkInitImage.prefill(
            lastCreatedVmwareProvider?.spec?.settings?.vddkInitImage ?? ''
          );
        }
      } else {
        const spec = providerBeingEdited.spec;
        const secret = secretQuery.data;
        const { fields } = forms[providerType];

        fields.providerType.prefill(providerType);
        fields.name.prefill(providerBeingEdited.metadata.name);

        if (providerType === 'vsphere') {
          const vmwareFields = forms.vsphere.fields;
          vmwareFields.username.prefill(atob(secret?.data.user || ''));
          vmwareFields.password.prefill(atob(secret?.data.password || ''));
          vmwareFields.hostname.prefill(vmwareUrlToHostname(spec.url || ''));
          vmwareFields.fingerprint.prefill(atob(secret?.data.thumbprint || ''));
          vmwareFields.vddkInitImage.prefill(spec.settings?.vddkInitImage || '');
          vmwareFields.insecureSkipVerify.prefill(
            secret?.data.insecureSkipVerify
              ? stringToBoolean(atob(secret?.data.insecureSkipVerify))
              : false
          );
        }
        if (providerType === 'ovirt') {
          const ovirtFields = fields as typeof forms.ovirt.fields;
          ovirtFields.username.prefill(atob(secret?.data.user || ''));
          ovirtFields.password.prefill(atob(secret?.data.password || ''));
          ovirtFields.hostname.prefill(ovirtUrlToHostname(spec.url || ''));
          ovirtFields.caCert.prefill(atob(secret?.data.cacert || ''));
          ovirtFields.insecureSkipVerify.prefill(
            secret?.data.insecureSkipVerify
              ? stringToBoolean(atob(secret?.data.insecureSkipVerify))
              : false
          );
        }
        if (providerType === 'openstack') {
          const openstackFields = forms.openstack.fields;
          openstackFields.username.prefill(atob(secret?.data.username || ''));
          openstackFields.password.prefill(atob(secret?.data.password || ''));
          openstackFields.openstackUrl.prefill(spec.url || '');
          openstackFields.domainName.prefill(atob(secret?.data.domainName || ''));
          openstackFields.projectName.prefill(atob(secret?.data.projectName || ''));
          openstackFields.regionName.prefill(atob(secret?.data.regionName || ''));
          openstackFields.insecureSkipVerify.prefill(
            secret?.data.insecureSkipVerify
              ? stringToBoolean(atob(secret?.data.insecureSkipVerify))
              : true
          );
          openstackFields.caCertIfSecure.prefill(atob(secret?.data.cacert || ''));
        }
        if (providerType === 'openshift') {
          const openshiftFields = forms.openshift.fields;
          openshiftFields.openshiftUrl.prefill(spec.url || '');
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
