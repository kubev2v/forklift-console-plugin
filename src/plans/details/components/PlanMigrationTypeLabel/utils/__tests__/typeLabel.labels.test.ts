import { describe, expect, it } from '@jest/globals';
import { MigrationTypeValue } from 'src/plans/create/steps/migration-type/constants';

import { bodyContent, getLabelColor, typeLabel } from '../utils';

describe('PlanMigrationTypeLabel utils - labels', () => {
  it.each([
    [MigrationTypeValue.Live, 'Live', 'teal'],
    [MigrationTypeValue.Warm, 'Warm', 'orange'],
    [MigrationTypeValue.Conversion, 'Conversion', 'purple'],
    [MigrationTypeValue.Cold, 'Cold', 'blue'],
  ] as const)('maps %s to label/color', (type, label, color) => {
    expect(typeLabel(type)).toBe(label);
    expect(getLabelColor(type)).toBe(color);
    expect(bodyContent(type).length).toBeGreaterThan(0);
  });
});
