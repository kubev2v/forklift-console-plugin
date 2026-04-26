import type { FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import SectionHeading from '@components/headers/SectionHeading';
import { useForkliftTranslation } from '@utils/i18n';

import CertificateValidationField from './fields/CertificateValidationField';
import { ProviderFormFieldId } from './fields/constants';
import Ec2CredentialsFields from './fields/ec2/Ec2CredentialsFields';
import Ec2CrossAccountCredentialsFields from './fields/ec2/Ec2CrossAccountCredentialsFields';
import Ec2RegionField from './fields/ec2/Ec2RegionField';
import Ec2TargetSettingsFields from './fields/ec2/Ec2TargetSettingsFields';
import HypervCredentialsFields from './fields/hyperv/HypervCredentialsFields';
import HypervTransferMethodField from './fields/hyperv/HypervTransferMethodField';
import OpenShiftUrlField from './fields/openshift/OpenShiftUrlField';
import ServiceAccountTokenField from './fields/openshift/ServiceAccountTokenField';
import OpenStackAuthenticationTypeField from './fields/openstack/OpenStackAuthenticationTypeField';
import OpenStackUrlField from './fields/openstack/OpenStackUrlField';
import NfsDirectoryField from './fields/ova/NfsDirectoryField';
import OvaApplianceManagementField from './fields/ova/OvaApplianceManagementField';
import OvirtCredentialsFields from './fields/ovirt/OvirtCredentialsFields';
import OvirtUrlField from './fields/ovirt/OvirtUrlField';
import ProviderNameField from './fields/ProviderNameField';
import ProviderProjectField from './fields/ProviderProjectField';
import ProviderTypeField from './fields/ProviderTypeField';
import VsphereCredentialsFields from './fields/vsphere/VsphereCredentialsFields';
import VsphereEndpointTypeField from './fields/vsphere/VsphereEndpointTypeField';
import VsphereUrlField from './fields/vsphere/VsphereUrlField';
import VsphereVddkField from './fields/vsphere/VsphereVddkField';
import type { CreateProviderFormData } from './types';

const ProviderTypeFields: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useFormContext<CreateProviderFormData>();

  const [selectedProviderType, openshiftUrl, ovirtUrl, vsphereUrl] = useWatch({
    control,
    name: [
      ProviderFormFieldId.ProviderType,
      ProviderFormFieldId.OpenshiftUrl,
      ProviderFormFieldId.OvirtUrl,
      ProviderFormFieldId.VsphereUrl,
    ],
  });

  return (
    <>
      <ProviderProjectField />
      <ProviderTypeField />

      {selectedProviderType && <ProviderNameField />}

      {selectedProviderType === PROVIDER_TYPES.ec2 && (
        <>
          <Ec2RegionField />
          <SectionHeading text={t('Provider credentials')} />
          <Ec2CredentialsFields />
          <SectionHeading text={t('Target settings')} />
          <Ec2TargetSettingsFields />
          <Ec2CrossAccountCredentialsFields />
        </>
      )}

      {selectedProviderType === PROVIDER_TYPES.ova && (
        <>
          <NfsDirectoryField />
          <OvaApplianceManagementField />
        </>
      )}

      {selectedProviderType === PROVIDER_TYPES.openshift && (
        <>
          <OpenShiftUrlField />
          <SectionHeading text={t('Provider credentials')} />
          {openshiftUrl?.trim() && <ServiceAccountTokenField />}
          <CertificateValidationField />
        </>
      )}

      {selectedProviderType === PROVIDER_TYPES.openstack && (
        <>
          <OpenStackUrlField />
          <SectionHeading text={t('Provider credentials')} />
          <OpenStackAuthenticationTypeField />
          <CertificateValidationField />
        </>
      )}

      {selectedProviderType === PROVIDER_TYPES.ovirt && (
        <>
          <OvirtUrlField />
          <SectionHeading text={t('Provider credentials')} />
          {ovirtUrl?.trim() && <OvirtCredentialsFields />}
          <CertificateValidationField />
        </>
      )}

      {selectedProviderType === PROVIDER_TYPES.vsphere && (
        <>
          <VsphereEndpointTypeField />
          <VsphereUrlField />
          <VsphereVddkField />
          <SectionHeading text={t('Provider credentials')} />
          {vsphereUrl?.trim() && <VsphereCredentialsFields />}
          <CertificateValidationField />
        </>
      )}

      {selectedProviderType === PROVIDER_TYPES.hyperv && (
        <>
          <HypervTransferMethodField />
          <SectionHeading text={t('Provider credentials')} />
          <HypervCredentialsFields />
          <CertificateValidationField />
        </>
      )}
    </>
  );
};

export default ProviderTypeFields;
