import type { IoK8sApiCoreV1Secret } from '@kubev2v/types';

export type EditComponentProps = {
  secret: IoK8sApiCoreV1Secret;
  onChange: (newValue: IoK8sApiCoreV1Secret) => void;
};
