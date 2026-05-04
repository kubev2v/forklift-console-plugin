import type { V1beta1Plan, V1beta1Provider } from '@forklift-ui/types';
import { getName, getNamespace, getUID, getVddkInitImage } from '@utils/crds/common/selectors';
import { CONVERSION_LABELS, CONVERSION_TYPE } from '@utils/crds/conversion/constants';
import type { V1beta1Conversion } from '@utils/crds/conversion/types';

type BuildConversionCRParams = {
  plan: V1beta1Plan;
  provider: V1beta1Provider;
  vmId: string;
  vmName: string;
};

const isAlphanumericOrHyphen = (char: string): boolean =>
  (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char === '-';

const sanitizeK8sName = (name: string): string => {
  let result = '';
  let lastWasHyphen = false;

  for (const char of name.toLowerCase()) {
    if (isAlphanumericOrHyphen(char)) {
      if (char === '-') {
        if (!lastWasHyphen) {
          result += char;
          lastWasHyphen = true;
        }
      } else {
        result += char;
        lastWasHyphen = false;
      }
    } else if (!lastWasHyphen) {
      result += '-';
      lastWasHyphen = true;
    }
  }

  let start = 0;
  while (start < result.length && result[start] === '-') start += 1;
  let end = result.length;
  while (end > start && result[end - 1] === '-') end -= 1;

  const trimmed = result.slice(start, end).slice(0, 40);
  return trimmed || 'vm';
};

export const buildConversionCR = ({
  plan,
  provider,
  vmId,
  vmName,
}: BuildConversionCRParams): V1beta1Conversion => {
  const planName = getName(plan) ?? '';
  const planNamespace = getNamespace(plan) ?? '';
  const planUid = getUID(plan) ?? '';
  const safeVmName = sanitizeK8sName(vmName);

  return {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Conversion',
    metadata: {
      generateName: `deep-inspection-${safeVmName}-`,
      labels: {
        [CONVERSION_LABELS.CONVERSION_TYPE]: CONVERSION_TYPE.DEEP_INSPECTION,
        [CONVERSION_LABELS.PLAN]: planUid,
        [CONVERSION_LABELS.PLAN_NAME]: planName,
        [CONVERSION_LABELS.PLAN_NAMESPACE]: planNamespace,
        [CONVERSION_LABELS.VM_ID]: vmId,
      },
      namespace: planNamespace,
    },
    spec: {
      connection: {
        secret: {
          name: provider?.spec?.secret?.name,
          namespace: provider?.spec?.secret?.namespace,
        },
      },
      type: CONVERSION_TYPE.DEEP_INSPECTION,
      vddkImage: getVddkInitImage(provider),
      vm: {
        id: vmId,
        name: vmName,
        type: provider?.spec?.type,
      },
    },
  };
};
