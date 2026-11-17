import { getCreateProviderButtonLabel } from '../getCreateProviderButtonLabel';

jest.mock('src/utils/i18n', (): unknown => ({ t: (key: string): string => key }));

describe('getCreateProviderButtonLabel', () => {
  it('uses Deploy on the placement step', () => {
    expect(getCreateProviderButtonLabel(true, true)).toBe('Deploy');
    expect(getCreateProviderButtonLabel(true, false)).toBe('Deploy');
  });

  it('uses Create and continue when an appliance is selected', () => {
    expect(getCreateProviderButtonLabel(false, true)).toBe('Create and continue');
  });

  it('uses Create provider for the regular flow', () => {
    expect(getCreateProviderButtonLabel(false, false)).toBe('Create provider');
  });
});
