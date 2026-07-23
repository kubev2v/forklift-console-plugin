import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { describe, expect, it } from '@jest/globals';

import { PlanTableResourceId } from '../constants';
import { planFields } from '../planFields';

describe('planFields', () => {
  it('exposes Migration status and Migration type as selectable attribute filters', () => {
    const migrationStatus = planFields.find(
      (field) => field.resourceFieldId === PlanTableResourceId.Phase,
    );
    const migrationType = planFields.find(
      (field) => field.resourceFieldId === PlanTableResourceId.MigrationType,
    );

    expect(migrationStatus?.filter?.isHidden).toBeUndefined();
    expect(migrationStatus?.filter?.placeholderLabel).toBe('Filter by status');
    expect(migrationStatus?.filter?.values?.length).toBeGreaterThan(0);

    expect(migrationType?.filter?.isHidden).toBeUndefined();
    expect(migrationType?.filter?.placeholderLabel).toBe('Filter by type');
    expect(migrationType?.filter?.values?.length).toBeGreaterThan(0);
  });
});
