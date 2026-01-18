import { useMemo } from 'react';

import type { K8sResourceCommon } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { getName } from '@utils/crds/common/selectors.ts';
import { isUpstream } from '@utils/env.ts';

const useWatchProjectNames = (): [string[], boolean, Error | null] => {
  const [projects, projectsLoaded, projectsLoadError] = useK8sWatchResource<K8sResourceCommon[]>({
    isList: true,
    kind: isUpstream() ? 'Namespace' : 'Project',
  });

  const projectNames = useMemo(
    () =>
      projectsLoaded && !projectsLoadError
        ? projects
            .reduce<string[]>((acc, project) => {
              const name = getName(project);
              if (name) {
                acc.push(name);
              }
              return acc;
            }, [])
            .sort((a, b) => a.localeCompare(b))
        : [],
    [projectsLoaded, projectsLoadError, projects],
  );

  return [projectNames, projectsLoaded, projectsLoadError as Error | null];
};

export default useWatchProjectNames;
