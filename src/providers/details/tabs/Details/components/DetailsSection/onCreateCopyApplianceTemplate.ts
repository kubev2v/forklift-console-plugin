import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { ProviderModel, type V1beta1Provider } from '@forklift-ui/types';
import { k8sCreate, k8sPatch, type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { CopyApplianceTemplateModel } from '@utils/crds/common/models';
import {
  getCopyApplianceResourcePool,
  getName,
  getNamespace,
  getToeholdDatastore,
  getToeholdFolder,
  getToeholdNetwork,
  getUID,
} from '@utils/crds/common/selectors';

import type { ToeholdPlacementFormValues } from './ToeholdPlacementForm';

type SettingPatch = {
  op: typeof ADD | typeof REPLACE;
  path: string;
  value: string | undefined;
};

const patchOp = (current: string | undefined, path: string, value: string): SettingPatch => ({
  op: current ? REPLACE : ADD,
  path,
  value: value || undefined,
});

const onCreateCopyApplianceTemplate = async (
  provider: V1beta1Provider,
  placement: ToeholdPlacementFormValues,
): Promise<K8sResourceCommon> => {
  const name = getName(provider);
  const namespace = getNamespace(provider);
  const uid = getUID(provider);
  if (!name || !namespace || !uid) {
    throw new Error('Provider is missing name, namespace, or uid');
  }

  const templateName = `${name}-toehold`;

  await k8sPatch({
    data: [
      patchOp(
        getToeholdDatastore(provider),
        '/spec/settings/toeholdDatastore',
        placement.datastore,
      ),
      patchOp(getToeholdFolder(provider), '/spec/settings/toeholdFolder', placement.folder),
      patchOp(getToeholdNetwork(provider), '/spec/settings/toeholdNetwork', placement.network),
      patchOp(
        getCopyApplianceResourcePool(provider),
        '/spec/settings/copyApplianceResourcePool',
        placement.resourcePool,
      ),
    ],
    model: ProviderModel,
    resource: provider,
  });

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
