import { defaultTargetPowerStateOption } from 'src/plans/constants';
import { defaultStorageMapping, StorageMapFieldId } from 'src/storageMaps/constants';

import { GeneralFormFieldId } from '../steps/general-information/constants';
import { HooksFormFieldId, MigrationHookFieldId } from '../steps/migration-hooks/constants';
import {
  defaultNetMapping,
  NetworkMapFieldId,
  NetworkMapType,
} from '../steps/network-map/constants';
import { defaultDiskPassPhrase, OtherSettingsFormFieldId } from '../steps/other-settings/constants';
import { CreatePlanStorageMapFieldId, StorageMapType } from '../steps/storage-map/constants';
import { defaultVms, VmFormFieldId } from '../steps/virtual-machines/constants';
import type { CreatePlanFormData } from '../types';

/**
 * Returns the default form values used when initializing the migration plan form.
 * Accepts optional overrides for `planProject` and `sourceProvider`.
 */
export const getDefaultFormValues = (
  initialValues?: Pick<CreatePlanFormData, 'planProject' | 'sourceProvider'>,
): Partial<CreatePlanFormData> => {
  return {
    [CreatePlanStorageMapFieldId.StorageMapType]: StorageMapType.Existing,
    [GeneralFormFieldId.PlanProject]: initialValues?.planProject,
    [GeneralFormFieldId.ShowDefaultProjects]: false,
    [GeneralFormFieldId.SourceProvider]: initialValues?.sourceProvider,
    [HooksFormFieldId.PostMigration]: {
      [MigrationHookFieldId.EnableHook]: false,
    },
    [HooksFormFieldId.PreMigration]: {
      [MigrationHookFieldId.EnableHook]: false,
    },
    [NetworkMapFieldId.NetworkMap]: [defaultNetMapping],
    [NetworkMapFieldId.NetworkMapType]: NetworkMapType.Existing,
    [OtherSettingsFormFieldId.DiskDecryptionPassPhrases]: [defaultDiskPassPhrase],
    [OtherSettingsFormFieldId.MigrateSharedDisks]: true,
    [OtherSettingsFormFieldId.TargetPowerState]: defaultTargetPowerStateOption,
    [StorageMapFieldId.StorageMap]: [defaultStorageMapping],
    [VmFormFieldId.Vms]: defaultVms,
  };
};
