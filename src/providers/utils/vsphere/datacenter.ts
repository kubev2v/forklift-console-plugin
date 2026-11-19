import { VSphereEndpointType } from 'src/providers/utils/constants';

import type { V1beta1Provider } from '@forklift-ui/types';
import { getSdkEndpoint } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

export const isVSphereEsxiProvider = (provider: V1beta1Provider): boolean =>
  getSdkEndpoint(provider) === VSphereEndpointType.ESXi;

const toPathSegments = (value: string | undefined): string[] =>
  (value?.split('/') ?? []).map((segment) => segment.trim()).filter(Boolean);

export const isCopyApplianceFolderWithinDatacenter = (
  folder: string | undefined,
  datacenter: string | undefined,
): boolean => {
  const folderSegments = toPathSegments(folder);

  if (isEmpty(folderSegments)) {
    return false;
  }

  const datacenterSegments = toPathSegments(datacenter);

  if (isEmpty(datacenterSegments)) {
    return true;
  }

  // A datacenter path must be a contiguous prefix of the folder path; a single
  // datacenter name may appear anywhere because folders can nest datacenters.
  if (datacenterSegments.length > 1) {
    return datacenterSegments.every((segment, index) => folderSegments[index] === segment);
  }

  const [datacenterName] = datacenterSegments;

  return folderSegments.includes(datacenterName);
};

export const getDatacenterNames = (inventory: { name: string }[] | null | undefined): string[] =>
  [
    ...new Set(
      (Array.isArray(inventory) ? inventory : []).map((item) => item.name.trim()).filter(Boolean),
    ),
  ].sort((first, second) => first.localeCompare(second));
