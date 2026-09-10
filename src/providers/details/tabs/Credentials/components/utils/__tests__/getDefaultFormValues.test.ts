import {
  CertificateValidationMode,
  ProviderFormFieldId,
} from 'src/providers/create/fields/constants';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';

import { getDefaultFormValues } from '../getDefaultFormValues';

const emptySecret: IoK8sApiCoreV1Secret = { data: {} };

const providerWithUrl = (type: string, url?: string): V1beta1Provider => ({
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Provider',
  metadata: { name: 'p', namespace: 'ns' },
  spec: { secret: { name: 's', namespace: 'ns' }, type, url },
});

describe('getDefaultFormValues - provider URL seeding', () => {
  it.each([
    ['vsphere', ProviderFormFieldId.VsphereUrl, 'https://vcenter.example.com'],
    ['ovirt', ProviderFormFieldId.OvirtUrl, 'https://engine.example.com'],
    ['nutanix', ProviderFormFieldId.NutanixUrl, 'https://nutanix.example.com'],
    ['openshift', ProviderFormFieldId.OpenshiftUrl, 'https://api.openshift.example.com'],
    ['openstack', ProviderFormFieldId.OpenstackUrl, 'https://keystone.example.com:5000'],
  ])('seeds %s URL from provider spec', (type, fieldId, url) => {
    const result = getDefaultFormValues(emptySecret, providerWithUrl(type, url));

    expect(result[fieldId]).toBe(url);
  });

  it.each([
    ['vsphere', ProviderFormFieldId.VsphereUrl],
    ['ovirt', ProviderFormFieldId.OvirtUrl],
    ['nutanix', ProviderFormFieldId.NutanixUrl],
    ['openshift', ProviderFormFieldId.OpenshiftUrl],
    ['openstack', ProviderFormFieldId.OpenstackUrl],
  ])('defaults %s URL to empty string when spec.url is missing', (type, fieldId) => {
    const result = getDefaultFormValues(emptySecret, providerWithUrl(type));

    expect(result[fieldId]).toBe('');
  });

  it('seeds HypervHost from provider spec (regression)', () => {
    const url = '192.168.1.10';
    const result = getDefaultFormValues(emptySecret, providerWithUrl('hyperv', url));

    expect(result[ProviderFormFieldId.HypervHost]).toBe(url);
  });

  it.each(['ec2', 'ova'])('does not seed URL fields for %s', (type) => {
    const result = getDefaultFormValues(
      emptySecret,
      providerWithUrl(type, 'https://should-not-appear.example.com'),
    );

    expect(result[ProviderFormFieldId.VsphereUrl]).toBeUndefined();
    expect(result[ProviderFormFieldId.OvirtUrl]).toBeUndefined();
    expect(result[ProviderFormFieldId.NutanixUrl]).toBeUndefined();
    expect(result[ProviderFormFieldId.OpenshiftUrl]).toBeUndefined();
    expect(result[ProviderFormFieldId.OpenstackUrl]).toBeUndefined();
    expect(result[ProviderFormFieldId.HypervHost]).toBeUndefined();
    expect(result[ProviderFormFieldId.CertificateValidation]).toBe(
      CertificateValidationMode.Configure,
    );
  });
});
