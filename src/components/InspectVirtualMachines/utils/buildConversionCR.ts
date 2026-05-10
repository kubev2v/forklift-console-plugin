import type { V1beta1Plan, V1beta1Provider } from '@forklift-ui/types';
import { ConversionModel } from '@utils/crds/common/models';
import {
  getName,
  getNamespace,
  getProviderSecretRef,
  getType,
  getUID,
  getVddkInitImage,
} from '@utils/crds/common/selectors';
import { CONVERSION_LABELS, CONVERSION_TYPE } from '@utils/crds/conversion/constants';
import type { V1beta1Conversion } from '@utils/crds/conversion/types';
import { isEmpty } from '@utils/helpers';

import type { DiskEncryptionParam } from './types';

type BuildConversionCRParams = {
  diskEncryption?: DiskEncryptionParam;
  plan?: V1beta1Plan;
  provider: V1beta1Provider;
  vmId: string;
  vmName: string;
};

const DEFAULT_GENERATE_NAME_PREFIX = 'vm';

const sanitizeForK8sName = (value: string): string => {
  const sanitized = Array.from(value.toLowerCase()).reduce((acc, char) => {
    const isValid = (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9');
    if (isValid) return acc + char;
    if (!isEmpty(acc) && !acc.endsWith('-')) return `${acc}-`;
    return acc;
  }, '');

  const trimmed = sanitized.endsWith('-') ? sanitized.slice(0, -1) : sanitized;
  return trimmed.slice(0, 40) || DEFAULT_GENERATE_NAME_PREFIX;
};

const buildLabels = (
  provider: V1beta1Provider,
  plan: V1beta1Plan | undefined,
  vmId: string,
): Record<string, string> => {
  const labels: Record<string, string> = {
    [CONVERSION_LABELS.CONVERSION_TYPE]: CONVERSION_TYPE.DEEP_INSPECTION,
    [CONVERSION_LABELS.PROVIDER]: getUID(provider) ?? '',
    [CONVERSION_LABELS.VM_ID]: vmId,
  };

  if (plan) {
    labels[CONVERSION_LABELS.PLAN] = getUID(plan) ?? '';
    labels[CONVERSION_LABELS.PLAN_NAME] = getName(plan) ?? '';
    labels[CONVERSION_LABELS.PLAN_NAMESPACE] = getNamespace(plan) ?? '';
  }

  return labels;
};

export const buildConversionCR = ({
  diskEncryption,
  plan,
  provider,
  vmId,
  vmName,
}: BuildConversionCRParams): V1beta1Conversion => {
  const namespace = plan ? getNamespace(plan) : getNamespace(provider);
  const secretRef = getProviderSecretRef(provider);

  // Model constants produce the correct literal values
  return {
    apiVersion:
      `${ConversionModel.apiGroup}/${ConversionModel.apiVersion}` as V1beta1Conversion['apiVersion'],
    kind: ConversionModel.kind as V1beta1Conversion['kind'],
    metadata: {
      generateName: `deep-inspection-${sanitizeForK8sName(vmName)}-`,
      labels: buildLabels(provider, plan, vmId),
      namespace: namespace ?? '',
    },
    spec: {
      connection: {
        secret: {
          name: secretRef?.name,
          namespace: secretRef?.namespace,
        },
      },
      ...(diskEncryption && { diskEncryption }),
      targetNamespace: namespace ?? '',
      type: CONVERSION_TYPE.DEEP_INSPECTION,
      vddkImage: getVddkInitImage(provider),
      vm: {
        id: vmId,
        name: vmName,
        type: getType(provider),
      },
    },
  };
};
