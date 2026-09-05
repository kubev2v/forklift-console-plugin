import { CONDITION_STATUS } from '@utils/constants';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import { ProviderStatus } from '@utils/types';

import { getDetailsSectionByType, isApplianceManagementEnabled } from '../utils';

jest.mock('../../Ec2DetailsSection', (): unknown => ({ __esModule: true, default: 'Ec2' }));
jest.mock('../../HyperVDetailsSection', (): unknown => ({ __esModule: true, default: 'HyperV' }));
jest.mock('../../OpenshiftDetailsSection', (): unknown => ({
  __esModule: true,
  default: 'Openshift',
}));
jest.mock('../../OpenstackDetailsSection', (): unknown => ({
  __esModule: true,
  default: 'Openstack',
}));
jest.mock('../../OVADetailsSection', (): unknown => ({ __esModule: true, default: 'OVA' }));
jest.mock('../../OvirtDetailsSection', (): unknown => ({ __esModule: true, default: 'Ovirt' }));
jest.mock('../../VSphereDetailsSection', (): unknown => ({ __esModule: true, default: 'VSphere' }));

describe('DetailsSection utils - byType', () => {
  it.each([
    [PROVIDER_TYPES.ec2, 'Ec2'],
    [PROVIDER_TYPES.ovirt, 'Ovirt'],
    [PROVIDER_TYPES.openshift, 'Openshift'],
    [PROVIDER_TYPES.openstack, 'Openstack'],
    [PROVIDER_TYPES.vsphere, 'VSphere'],
    [PROVIDER_TYPES.ova, 'OVA'],
    [PROVIDER_TYPES.hyperv, 'HyperV'],
  ])('returns section component for %s', (type, section) => {
    expect(getDetailsSectionByType(type)).toBe(section);
  });

  it('returns undefined for unknown or missing type', () => {
    expect(getDetailsSectionByType(undefined)).toBeUndefined();
    expect(getDetailsSectionByType('unknown')).toBeUndefined();
  });

  it('detects appliance management condition', () => {
    const enabled = {
      status: {
        conditions: [
          { status: CONDITION_STATUS.TRUE, type: ProviderStatus.ApplianceManagementEnabled },
          { status: CONDITION_STATUS.FALSE, type: ProviderStatus.Ready },
        ],
      },
    };
    const disabled = {
      status: {
        conditions: [
          { status: CONDITION_STATUS.FALSE, type: ProviderStatus.ApplianceManagementEnabled },
        ],
      },
    };

    expect(isApplianceManagementEnabled(enabled as never)).toBe(true);
    expect(isApplianceManagementEnabled(disabled as never)).toBe(false);
    expect(isApplianceManagementEnabled({} as never)).toBe(false);
  });
});
