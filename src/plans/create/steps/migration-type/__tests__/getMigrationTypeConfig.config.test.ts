import { describe, expect, it } from '@jest/globals';

import { MigrationTypeValue } from '../constants';
import { getMigrationTypeConfig } from '../utils';

describe('getMigrationTypeConfig - config', () => {
  it('returns cold description without help link', () => {
    const config = getMigrationTypeConfig(MigrationTypeValue.Cold);
    expect(config.description).toMatch(/cold migration/i);
    expect(config.helpLink).toBeUndefined();
  });

  it('returns warm and live configs with help body', () => {
    expect(getMigrationTypeConfig(MigrationTypeValue.Warm).helpBody).toMatch(/warm migration/i);
    expect(getMigrationTypeConfig(MigrationTypeValue.Live).helpBody).toMatch(/live migration/i);
  });

  it('returns empty description for conversion/default', () => {
    expect(getMigrationTypeConfig(MigrationTypeValue.Conversion).description).toBe('');
  });
});
