import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { ConversionModelGroupVersionKind } from '@utils/crds/common/models';

import type { V1beta1Conversion } from '../crds/conversion/types';

type UseWatchConversionsOptions = {
  namespace: string;
  selector: {
    matchLabels: Record<string, string>;
  };
};

type UseWatchConversionsResult = [V1beta1Conversion[], boolean, unknown];

export const useWatchConversions = ({
  namespace,
  selector,
}: UseWatchConversionsOptions): UseWatchConversionsResult => {
  const [conversions, loaded, error] = useK8sWatchResource<V1beta1Conversion[]>({
    groupVersionKind: ConversionModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
    selector,
  });

  return [conversions ?? [], loaded, error];
};
