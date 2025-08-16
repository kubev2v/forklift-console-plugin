import { useCallback, useMemo } from 'react';

import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { ALL_PROJECTS_KEY, Namespace } from '@utils/constants';
import { getDefaultNamespace } from '@utils/namespaces';

/**
 * Determines the default project/namespace for use in forms.
 * - Uses the active namespace unless in "All Projects" view, in which case it uses the default namespace.
 * - Falls back to 'openshift-mtv' if the preferred namespace isn't in the project names.
 * - Returns an empty string if no matching namespace is available.
 */
export const useDefaultProject = (projectNames: string[]) => {
  const [activeNamespace] = useActiveNamespace();
  const defaultNamespace = getDefaultNamespace();

  // Check if a given namespace exists in the available project options
  const projectExists = useCallback(
    (project: string) => projectNames?.includes(project),
    [projectNames],
  );

  // Determine the initial project by checking active namespace against available options
  const planProject = useMemo(() => {
    const defaultProject =
      activeNamespace === ALL_PROJECTS_KEY ? defaultNamespace : activeNamespace;

    // Only set the default project if it exists in available options
    if (projectExists(defaultProject)) {
      return defaultProject;
    }

    if (projectExists(Namespace.OpenshiftMtv)) {
      return Namespace.OpenshiftMtv;
    }

    return '';
  }, [activeNamespace, defaultNamespace, projectExists]);

  return planProject;
};
