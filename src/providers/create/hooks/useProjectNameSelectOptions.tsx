import type { K8sResourceCommon } from '@kubev2v/types';
import { useFlag, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { getName } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

const useProjectNameSelectOptions = (defaultProject?: string) => {
  const isUseProjects = useFlag('OPENSHIFT'); // u/s or d/s installation

  const [projects, projectsLoaded, projectsLoadError] = useK8sWatchResource<K8sResourceCommon[]>({
    isList: true,
    kind: isUseProjects ? 'Project' : 'Namespace',
  });

  const defaultOption = defaultProject ? [{ content: defaultProject, value: defaultProject }] : [];

  const selectOptions =
    isEmpty(projects) || !projectsLoaded || projectsLoadError
      ? // In case of an error or an empty list, returns the active namespace
        defaultOption
      : projects.map((project) => ({
          content: getName(project) ?? '',
          value: getName(project) ?? '',
        }));

  return [selectOptions];
};

export default useProjectNameSelectOptions;
