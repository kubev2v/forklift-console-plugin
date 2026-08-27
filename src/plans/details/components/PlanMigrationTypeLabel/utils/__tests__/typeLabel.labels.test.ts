import { MigrationTypeValue } from 'src/plans/create/steps/migration-type/constants';

import { describe, expect, it } from '@jest/globals';

import { bodyContent, getLabelColor, typeLabel } from '../utils';

describe('PlanMigrationTypeLabel utils - labels', () => {
  it('maps live to label/color', () => {
    expect(typeLabel(MigrationTypeValue.Live)).toBe('Live');
    expect(getLabelColor(MigrationTypeValue.Live)).toBe('teal');
    expect(bodyContent(MigrationTypeValue.Live).length).toBeGreaterThan(0);
  });

  it('maps warm to label/color', () => {
    expect(typeLabel(MigrationTypeValue.Warm)).toBe('Warm');
    expect(getLabelColor(MigrationTypeValue.Warm)).toBe('orange');
    expect(bodyContent(MigrationTypeValue.Warm).length).toBeGreaterThan(0);
  });

  it('maps conversion to label/color', () => {
    expect(typeLabel(MigrationTypeValue.Conversion)).toBe('Conversion');
    expect(getLabelColor(MigrationTypeValue.Conversion)).toBe('purple');
    expect(bodyContent(MigrationTypeValue.Conversion).length).toBeGreaterThan(0);
  });

  it('maps cold to label/color', () => {
    expect(typeLabel(MigrationTypeValue.Cold)).toBe('Cold');
    expect(getLabelColor(MigrationTypeValue.Cold)).toBe('blue');
    expect(bodyContent(MigrationTypeValue.Cold).length).toBeGreaterThan(0);
  });
});
