import { CopyApplianceTemplateModel } from '@forklift-ui/types';

const NOT_FOUND_STATUS = 404;

type KubernetesStatus = {
  code?: number;
  details?: { group?: string; kind?: string; name?: string };
  reason?: string;
};

type KubernetesHttpError = {
  code?: number;
  json?: KubernetesStatus;
};

export const isMissingCopyApplianceTemplate = (
  error: unknown,
  templateName: string | undefined,
): boolean => {
  if (!templateName || typeof error !== 'object' || error === null) {
    return false;
  }

  const { code, json } = error as KubernetesHttpError;
  const details = json?.details;
  const expectedKind = CopyApplianceTemplateModel.plural.toLowerCase();

  return (
    code === NOT_FOUND_STATUS &&
    json?.reason === 'NotFound' &&
    details?.name === templateName &&
    details.group === CopyApplianceTemplateModel.apiGroup &&
    details.kind?.toLowerCase() === expectedKind
  );
};
