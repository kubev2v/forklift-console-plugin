import type { V1beta1NetworkMapSpecMapDestination } from '@forklift-ui/types';
import { IGNORED, POD } from '@utils/constants';

export const isNetworkIPModeEditable = (
  destination: V1beta1NetworkMapSpecMapDestination | undefined,
): boolean => {
  if (!destination) {
    return false;
  }

  return destination.type !== IGNORED && destination.type !== POD;
};
