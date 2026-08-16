import { useMemo } from 'react';

import type { K8sResourceCommon } from '@forklift-ui/types';
import { getName } from '@utils/crds/common/selectors';
import { isUpstream } from '@utils/env';
import { useTypedK8sWatchResource } from '@utils/hooks/useTypedK8sWatchResource';

const useWatchProjectNames = (): [string[], boolean, Error | null] => {
  const [projects, projectsLoaded, projectsLoadError] = useTypedK8sWatchResource<
    K8sResourceCommon[]
  >({
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

  return [projectNames, projectsLoaded, projectsLoadError];
};

export default useWatchProjectNames;
