import type { FC } from 'react';

import type { V1beta1Provider } from '@kubev2v/types';
import { useTargetNamespaces } from '@utils/hooks/useTargetNamespaces';

import type { TargetNamespaceSelectInputProps } from './utils/types';
import TargetNamespaceSelect from './TargetNamespaceSelect';

type RemoteProviderNamespaceSelectProps = TargetNamespaceSelectInputProps & {
  targetProvider?: V1beta1Provider;
};

const RemoteProviderNamespaceSelect: FC<RemoteProviderNamespaceSelectProps> = ({
  onChange,
  targetProvider,
  value,
}) => {
  const [projectNames] = useTargetNamespaces(targetProvider);

  return <TargetNamespaceSelect projectNames={projectNames} value={value} onChange={onChange} />;
};

export default RemoteProviderNamespaceSelect;
