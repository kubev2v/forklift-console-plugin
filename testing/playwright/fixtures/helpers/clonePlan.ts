import type { V1beta1Plan } from '@forklift-ui/types';

import { BaseResourceManager } from '../../utils/resource-manager/BaseResourceManager';
import { API_PATHS, MTV_NAMESPACE } from '../../utils/resource-manager/constants';
import type { ResourceManager } from '../../utils/resource-manager/ResourceManager';

/**
 * Clone a Plan CR via the API, reusing the source spec (maps, VMs, providers).
 * Tracks the clone on ResourceManager so global teardown still cleans it up.
 */
export const clonePlan = async (
  resourceManager: ResourceManager,
  sourcePlanName: string,
  cloneName: string,
  namespace = MTV_NAMESPACE,
): Promise<V1beta1Plan> => {
  const source = await resourceManager.fetchPlan(sourcePlanName, namespace);
  if (!source?.spec) {
    throw new Error(`Cannot clone plan ${sourcePlanName}: source not found`);
  }

  const clone: V1beta1Plan = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Plan',
    metadata: {
      name: cloneName,
      namespace,
    },
    spec: {
      ...source.spec,
      archived: false,
    },
  };

  const created = await BaseResourceManager.apiPost<V1beta1Plan>(
    `${API_PATHS.FORKLIFT}/namespaces/${namespace}/plans`,
    clone,
  );

  if (!created) {
    throw new Error(`Failed to clone plan ${sourcePlanName} as ${cloneName}`);
  }

  resourceManager.addPlan(cloneName, namespace);
  return created;
};
