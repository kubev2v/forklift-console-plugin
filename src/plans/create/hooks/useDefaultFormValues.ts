import { useMemo } from 'react';

import { useProjectNameSelectOptions } from '@components/common/ProjectNameSelect';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { ALL_PROJECTS_KEY } from '@utils/constants';
import { getDefaultNamespace } from '@utils/namespaces';

import { GeneralFormFieldId } from '../steps/general-information/constants';
import { HooksFormFieldId, MigrationHookFieldId } from '../steps/hooks/constants';
import { NetworkMapFieldId, NetworkMapType } from '../steps/network-map/constants';
import { OtherSettingsFormFieldId } from '../steps/other-settings/constants';
import type { CreatePlanFormData } from '../types';

/**
 * Hook to generate default form values for the migration plan creation form
 * Determines the initial project/namespace and sets up empty disk decryption fields
 */
export const useDefaultFormValues = (
  initialValues?: Pick<CreatePlanFormData, 'planProject' | 'sourceProvider'>,
): Partial<CreatePlanFormData> => {
  const [activeNamespace] = useActiveNamespace();
  const defaultNamespace = getDefaultNamespace();
  const [projectOptions] = useProjectNameSelectOptions();

  // Determine the initial project by checking active namespace against available options
  const initialPlanProject = useMemo(() => {
    // If we're in "All Projects" view, use the default namespace
    // Otherwise use the currently active namespace
    const defaultProject =
      activeNamespace === ALL_PROJECTS_KEY ? defaultNamespace : activeNamespace;

    // Only set the default project if it exists in available options
    if (projectOptions?.find((option) => option.value === defaultProject)) {
      return defaultProject;
    }

    return '';
  }, [activeNamespace, defaultNamespace, projectOptions]);

  return {
    [GeneralFormFieldId.PlanProject]: initialValues?.planProject ?? initialPlanProject,
    [GeneralFormFieldId.SourceProvider]: initialValues?.sourceProvider,
    [HooksFormFieldId.PostMigration]: {
      [MigrationHookFieldId.EnableHook]: false,
    },
    [HooksFormFieldId.PreMigration]: {
      [MigrationHookFieldId.EnableHook]: false,
    },
    [NetworkMapFieldId.NetworkMapType]: NetworkMapType.Existing,
    [OtherSettingsFormFieldId.DiskDecryptionPassPhrases]: [{ value: '' }],
  };
};
