import { MigrationTypeValue } from 'src/plans/create/steps/migration-type/constants';

import { describe, expect, it } from '@jest/globals';

import { bodyContent, getLabelColor, typeLabel } from '../utils';

describe('PlanMigrationTypeLabel utils - labels', () => {
  it('maps live to label/color', () => {
    expect(typeLabel(MigrationTypeValue.Live)).toBe('Live');
    expect(getLabelColor(MigrationTypeValue.Live)).toBe('teal');
    expect(bodyContent(MigrationTypeValue.Live)).toBe(
      'With a live migration, we will move an active virtual machine without downtime.',
    );
  });

  it('maps warm to label/color', () => {
    expect(typeLabel(MigrationTypeValue.Warm)).toBe('Warm');
    expect(getLabelColor(MigrationTypeValue.Warm)).toBe('orange');
    expect(bodyContent(MigrationTypeValue.Warm)).toBe(
      'With a warm migration, we will move an active virtual machine between hosts with minimal downtime. This is not a live migration.',
    );
  });

  it('maps conversion to label/color', () => {
    expect(typeLabel(MigrationTypeValue.Conversion)).toBe('Conversion');
    expect(getLabelColor(MigrationTypeValue.Conversion)).toBe('purple');
    expect(bodyContent(MigrationTypeValue.Conversion)).toBe(
      'With a conversion migration, we will convert a virtual machine to a different architecture.',
    );
  });

  it('maps cold to label/color', () => {
    expect(typeLabel(MigrationTypeValue.Cold)).toBe('Cold');
    expect(getLabelColor(MigrationTypeValue.Cold)).toBe('blue');
    expect(bodyContent(MigrationTypeValue.Cold)).toBe(
      'With a cold migration, we will move the shut down VM between hosts.',
    );
  });
});
