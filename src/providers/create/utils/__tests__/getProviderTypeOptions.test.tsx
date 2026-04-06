import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import { describe, expect, it } from '@jest/globals';

import { getProviderTypeOptions } from '../getProviderTypeOptions';

describe('getProviderTypeOptions', () => {
  it('should include EC2 option when cluster is on AWS platform', () => {
    const options = getProviderTypeOptions(false, true);
    const ec2Option = options.find((option) => option.value === PROVIDER_TYPES.ec2);

    expect(ec2Option).toBeDefined();
    expect(ec2Option?.label).toBe('Amazon EC2');
  });

  it('should exclude EC2 option when cluster is not on AWS platform', () => {
    const options = getProviderTypeOptions(false, false);
    const ec2Option = options.find((option) => option.value === PROVIDER_TYPES.ec2);

    expect(ec2Option).toBeUndefined();
  });

  it('should always include non-EC2 provider types regardless of platform', () => {
    const nonEc2Types = [
      PROVIDER_TYPES.openshift,
      PROVIDER_TYPES.openstack,
      PROVIDER_TYPES.ova,
      PROVIDER_TYPES.hyperv,
      PROVIDER_TYPES.ovirt,
      PROVIDER_TYPES.vsphere,
    ];

    const awsOptions = getProviderTypeOptions(false, true);
    const nonAwsOptions = getProviderTypeOptions(false, false);

    for (const type of nonEc2Types) {
      expect(awsOptions.find((option) => option.value === type)).toBeDefined();
      expect(nonAwsOptions.find((option) => option.value === type)).toBeDefined();
    }
  });
});
