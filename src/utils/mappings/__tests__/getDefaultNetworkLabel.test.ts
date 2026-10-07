import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { POD } from '@utils/constants';

jest.mock('@utils/i18n', () => {
  const state = { label: 'Default network' };

  return {
    readDefaultNetworkLabelState: (): { label: string } => state,
    t: (key: string): string => (key === 'Default network' ? state.label : key),
  };
});

import * as i18n from '@utils/i18n';

import { getDefaultNetworkLabel, isDefaultNetworkTarget } from '../constants';

const labelState = (
  i18n as unknown as { readDefaultNetworkLabelState: () => { label: string } }
).readDefaultNetworkLabelState();

describe('getDefaultNetworkLabel', () => {
  beforeEach(() => {
    labelState.label = 'Default network';
  });

  it('reads the translation when called instead of when the module loads', () => {
    expect(getDefaultNetworkLabel()).toBe('Default network');

    labelState.label = 'Red predeterminada';

    expect(getDefaultNetworkLabel()).toBe('Red predeterminada');
  });

  it('still recognizes a pod network after the label language changes', () => {
    const selected = { id: POD, name: getDefaultNetworkLabel() };

    labelState.label = 'Red predeterminada';

    expect(isDefaultNetworkTarget(selected)).toBe(true);
    expect(isDefaultNetworkTarget({ name: 'Red predeterminada' })).toBe(true);
    expect(isDefaultNetworkTarget({ name: 'Default network' })).toBe(false);
  });
});
