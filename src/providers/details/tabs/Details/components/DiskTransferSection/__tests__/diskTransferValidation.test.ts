import { VddkSetupMode } from 'src/providers/utils/constants';

import {
  getCopyAppliancePermissionError,
  getTemplateLookupError,
  getTemplateOperation,
} from '../diskTransferValidation';

jest.mock('src/utils/i18n', (): unknown => ({ t: (key: string): string => key }));

describe('getTemplateOperation', () => {
  it.each([
    [true, false, 'create'],
    [false, true, 'delete'],
    [true, true, undefined],
    [false, false, undefined],
  ])('appliance=%s template=%s -> %s', (isAppliance, templateExists, expected) => {
    expect(getTemplateOperation(isAppliance, templateExists)).toBe(expected);
  });
});

describe('getTemplateLookupError', () => {
  it('is silent when lookup succeeded', () => {
    expect(getTemplateLookupError(VddkSetupMode.Manual, VddkSetupMode.Skip, false)).toBeUndefined();
  });

  it('is silent for VDDK methods when the provider never used an appliance', () => {
    expect(getTemplateLookupError(VddkSetupMode.Manual, VddkSetupMode.Skip, true)).toBeUndefined();
    expect(getTemplateLookupError(VddkSetupMode.Upload, VddkSetupMode.Skip, true)).toBeUndefined();
  });

  it('reports VDDK methods when the provider was configured with an appliance', () => {
    expect(getTemplateLookupError(VddkSetupMode.Manual, VddkSetupMode.CopyAppliance, true)).toBe(
      'Could not check the sourcing appliance setup. Try again; if the problem continues, contact your administrator.',
    );
  });

  it('reports appliance and skip methods when lookup is unavailable', () => {
    expect(getTemplateLookupError(VddkSetupMode.Skip, VddkSetupMode.Skip, true)).toBeDefined();
    expect(
      getTemplateLookupError(VddkSetupMode.CopyAppliance, VddkSetupMode.Skip, true),
    ).toBeDefined();
  });
});

describe('getCopyAppliancePermissionError', () => {
  it('blocks appliance setup when the feature is disabled', () => {
    expect(getCopyAppliancePermissionError(true, false, false)).toBe(
      'Copy appliance setup is unavailable while the feature is disabled.',
    );
  });

  it('returns the access review error when lookup succeeded', () => {
    expect(getCopyAppliancePermissionError(true, true, false, 'denied')).toBe('denied');
  });

  it('hides the access review error when lookup itself is unavailable', () => {
    expect(getCopyAppliancePermissionError(true, true, true, 'denied')).toBeUndefined();
  });

  it('does not block VDDK methods', () => {
    expect(getCopyAppliancePermissionError(false, true, false)).toBeUndefined();
  });
});
