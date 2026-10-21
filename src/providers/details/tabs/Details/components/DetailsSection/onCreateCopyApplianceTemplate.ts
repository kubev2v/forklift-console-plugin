import {
  CopyApplianceTemplateModel,
  ProviderModel,
  type V1beta1CopyApplianceTemplate,
  type V1beta1Provider,
} from '@forklift-ui/types';
import { k8sCreate, k8sGet, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';
import { getCopyApplianceTemplateName } from '@utils/crds/providers/selectors';
import { isEmpty } from '@utils/helpers';

import { buildCopyAppliancePlacementPatches } from './buildCopyApplianceSettingPatch';
import type { CopyAppliancePlacementValues } from './copyAppliancePlacementConfig';
import { CopyApplianceTemplatePlacementMismatchError } from './CopyApplianceTemplatePlacementMismatchError';

const findCreatedTemplate = async (
  provider: V1beta1Provider,
  templateName: string,
  placement: CopyAppliancePlacementValues,
): Promise<V1beta1CopyApplianceTemplate | undefined> => {
  let template: V1beta1CopyApplianceTemplate;
  try {
    template = await k8sGet<V1beta1CopyApplianceTemplate>({
      model: CopyApplianceTemplateModel,
      name: templateName,
      ns: getNamespace(provider),
    });
  } catch {
    return undefined;
  }

  const belongsToProvider = template.metadata?.ownerReferences?.some(
    (owner) => owner.kind === 'Provider' && owner.uid === getUID(provider),
  );
  if (
    getName(template) !== templateName ||
    getNamespace(template) !== getNamespace(provider) ||
    template.spec?.provider?.name !== getName(provider) ||
    template.spec?.provider?.namespace !== getNamespace(provider) ||
    !belongsToProvider
  ) {
    return undefined;
  }
  if (
    template.spec?.datastore !== placement.datastore ||
    template.spec?.folder !== placement.folder ||
    template.spec?.network !== placement.network ||
    template.spec?.templateName !== templateName
  ) {
    throw new CopyApplianceTemplatePlacementMismatchError();
  }
  return template;
};

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

  try {
    return await k8sCreate({
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
  } catch (error) {
    const existing = await findCreatedTemplate(provider, templateName, placement);
    if (existing) {
      return existing;
    }
    throw error;
  }
};

export default onCreateCopyApplianceTemplate;
