import { describe, expect, it } from '@jest/globals';

import { MigrationTypeValue } from '../constants';
import { getMigrationTypeConfig } from '../utils';

describe('getMigrationTypeConfig - config', () => {
  it('returns cold description without help link', () => {
    const config = getMigrationTypeConfig(MigrationTypeValue.Cold);
    expect(config.description).toMatch(/cold migration/i);
    expect(config.helpLink).toBeUndefined();
  });

  it('returns warm config with distinct description and help body', () => {
    const config = getMigrationTypeConfig(MigrationTypeValue.Warm);
    expect(config.description).toMatch(/warm migration/i);
    expect(config.helpBody).toMatch(/warm migration/i);
    expect(config.description).not.toBe(config.helpBody);
    expect(config.helpLink).toBeUndefined();
  });

  it('returns live config with matching description and help body', () => {
    const config = getMigrationTypeConfig(MigrationTypeValue.Live);
    expect(config.description).toMatch(/live migration/i);
    expect(config.helpBody).toBe(config.description);
    expect(config.helpLink).toBeUndefined();
  });

  it('returns empty description for conversion/default', () => {
    expect(getMigrationTypeConfig(MigrationTypeValue.Conversion).description).toBe('');
  });
});
