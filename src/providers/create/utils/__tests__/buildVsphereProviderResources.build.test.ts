import { decode } from 'js-base64';
import { VSphereEndpointType } from 'src/providers/utils/constants';

import { describe, expect, it } from '@jest/globals';

import { VddkSetupMode } from '../../../utils/constants';
import { CertificateValidationMode, ProviderFormFieldId } from '../../fields/constants';
import { buildVsphereProviderResources } from '../buildVsphereProviderResources';

describe('buildVsphereProviderResources - build', () => {
  it('sets sdk endpoint and optional vddk settings', () => {
    const { provider, secret } = buildVsphereProviderResources({
      [ProviderFormFieldId.CertificateValidation]: CertificateValidationMode.Skip,
      [ProviderFormFieldId.ProviderName]: 'vsphere',
      [ProviderFormFieldId.ProviderProject]: 'ns',
      [ProviderFormFieldId.ProviderType]: 'vsphere',
      [ProviderFormFieldId.ShowDefaultProjects]: false,
      [ProviderFormFieldId.VsphereEndpointType]: VSphereEndpointType.ESXi,
      [ProviderFormFieldId.VspherePassword]: 'p',
      [ProviderFormFieldId.VsphereUrl]: 'https://esxi',
      [ProviderFormFieldId.VsphereUsername]: 'root',
      [ProviderFormFieldId.VsphereUseVddkAioOptimization]: true,
      [ProviderFormFieldId.VsphereVddkInitImage]: 'quay.io/vddk:latest',
      [ProviderFormFieldId.VsphereVddkSetupMode]: VddkSetupMode.Manual,
    });

    expect(provider.spec?.settings).toEqual(
      expect.objectContaining({
        sdkEndpoint: VSphereEndpointType.ESXi,
        useVddkAioOptimization: 'true',
        vddkInitImage: 'quay.io/vddk:latest',
      }),
    );
    expect(decode(secret.data?.url ?? '')).toBe('https://esxi');
  });

  it('skips vddk settings when setup mode is Skip', () => {
    const { provider } = buildVsphereProviderResources({
      [ProviderFormFieldId.ProviderName]: 'vsphere',
      [ProviderFormFieldId.ProviderProject]: 'ns',
      [ProviderFormFieldId.ProviderType]: 'vsphere',
      [ProviderFormFieldId.ShowDefaultProjects]: false,
      [ProviderFormFieldId.VsphereUrl]: 'https://vc',
      [ProviderFormFieldId.VsphereVddkInitImage]: 'ignored',
      [ProviderFormFieldId.VsphereVddkSetupMode]: VddkSetupMode.Skip,
    });

    expect(provider.spec?.settings?.vddkInitImage).toBeUndefined();
  });
});
