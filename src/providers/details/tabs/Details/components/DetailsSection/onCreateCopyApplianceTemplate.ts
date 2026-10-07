import {
  CopyApplianceTemplateModel,
  ProviderModel,
  type V1beta1CopyApplianceTemplate,
  type V1beta1Provider,
} from '@forklift-ui/types';
import { k8sCreate, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';
import { getCopyApplianceTemplateName } from '@utils/crds/providers/selectors';
import { isEmpty } from '@utils/helpers';

import { buildCopyAppliancePlacementPatches } from './buildCopyApplianceSettingPatch';
import type { CopyAppliancePlacementValues } from './copyAppliancePlacementConfig';

const onCreateCopyApplianceTemplate = async (
  provider: V1beta1Provider,
  placement: CopyAppliancePlacementValues,
): Promise<V1beta1CopyApplianceTemplate> => {
  const name = getName(provider);
  const namespace = getNamespace(provider);
  const uid = getUID(provider);
  if (!name || !namespace || !uid) {
    throw new Error('Provider is missing name, namespace, or uid');
  }

  const templateName = getCopyApplianceTemplateName(provider);
  if (!templateName) {
    throw new Error('Provider is missing name');
  }

  const patches = buildCopyAppliancePlacementPatches(provider, placement);
  if (!isEmpty(patches)) {
    await k8sPatch({
      data: patches,
      model: ProviderModel,
      resource: provider,
    });
  }

  return k8sCreate({
    data: {
      apiVersion: `${CopyApplianceTemplateModel.apiGroup}/${CopyApplianceTemplateModel.apiVersion}`,
      kind: CopyApplianceTemplateModel.kind,
      metadata: {
        name: templateName,
        namespace,
        ownerReferences: [
          {
            apiVersion: provider.apiVersion ?? 'forklift.konveyor.io/v1beta1',
            blockOwnerDeletion: true,
            controller: true,
            kind: provider.kind ?? 'Provider',
            name,
            uid,
          },
        ],
      },
      spec: {
        baseDisk: {},
        datastore: placement.datastore,
        folder: placement.folder,
        network: placement.network,
        provider: { name, namespace },
        templateName,
      },
    },
    model: CopyApplianceTemplateModel,
  });
};

export default onCreateCopyApplianceTemplate;
