import { GeneralFormFieldId } from '../steps/general-information/constants';
import { HooksFormFieldId, MigrationHookFieldId } from '../steps/migration-hooks/constants';
import { NetworkMapFieldId, NetworkMapType } from '../steps/network-map/constants';
import { OtherSettingsFormFieldId } from '../steps/other-settings/constants';
import { StorageMapFieldId, StorageMapType } from '../steps/storage-map/constants';
import type { CreatePlanFormData } from '../types';

/**
 * Returns the default form values used when initializing the migration plan form.
 * Accepts optional overrides for `planProject` and `sourceProvider`.
 */
export const getDefaultFormValues = (
  initialValues?: Pick<CreatePlanFormData, 'planProject' | 'sourceProvider'>,
): Partial<CreatePlanFormData> => {
  return {
    [GeneralFormFieldId.PlanProject]: initialValues?.planProject,
    [GeneralFormFieldId.SourceProvider]: initialValues?.sourceProvider,
    [HooksFormFieldId.PostMigration]: {
      [MigrationHookFieldId.EnableHook]: false,
    },
    [HooksFormFieldId.PreMigration]: {
      [MigrationHookFieldId.EnableHook]: false,
    },
    [NetworkMapFieldId.NetworkMapType]: NetworkMapType.Existing,
    [OtherSettingsFormFieldId.DiskDecryptionPassPhrases]: [],
    [StorageMapFieldId.StorageMapType]: StorageMapType.Existing,
  };
};
