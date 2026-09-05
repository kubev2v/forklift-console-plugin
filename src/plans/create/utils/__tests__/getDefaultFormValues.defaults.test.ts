import { describe, expect, it } from '@jest/globals';
import { NetworkMapFieldId, NetworkMapType } from '@utils/mappings/networkMap';
import { StorageMapFieldId } from '@utils/storage/types';

import { GeneralFormFieldId } from '../../steps/general-information/constants';
import { HooksFormFieldId, MigrationHookFieldId } from '../../steps/migration-hooks/constants';
import { CreatePlanStorageMapFieldId, StorageMapType } from '../../steps/storage-map/constants';
import { getDefaultFormValues } from '../getDefaultFormValues';

describe('getDefaultFormValues - defaults', () => {
  it('returns existing map types and disabled hooks by default', () => {
    const values = getDefaultFormValues();

    expect(values[GeneralFormFieldId.ShowDefaultProjects]).toBe(false);
    expect(values[HooksFormFieldId.PreMigration]?.[MigrationHookFieldId.EnableHook]).toBe(false);
    expect(values[HooksFormFieldId.PostMigration]?.[MigrationHookFieldId.EnableHook]).toBe(false);
    expect(values[GeneralFormFieldId.PlanProject]).toBeUndefined();
    expect(values[GeneralFormFieldId.SourceProvider]).toBeUndefined();
    expect(values[NetworkMapFieldId.NetworkMapType]).toBe(NetworkMapType.Existing);
    expect(values[CreatePlanStorageMapFieldId.StorageMapType]).toBe(StorageMapType.Existing);
    expect(values[NetworkMapFieldId.NetworkMap]).toHaveLength(1);
    expect(values[StorageMapFieldId.StorageMap]).toHaveLength(1);
  });

  it('applies optional planProject and sourceProvider overrides', () => {
    const sourceProvider = { metadata: { name: 'vsphere' } } as never;
    const values = getDefaultFormValues({ planProject: 'ns-a', sourceProvider });

    expect(values[GeneralFormFieldId.PlanProject]).toBe('ns-a');
    expect(values[GeneralFormFieldId.SourceProvider]).toBe(sourceProvider);
  });
});
