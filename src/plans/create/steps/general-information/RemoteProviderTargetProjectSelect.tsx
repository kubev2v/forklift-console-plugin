import type { FC } from 'react';

import type { V1beta1Provider } from '@forklift-ui/types';
import { useTargetNamespaces } from '@utils/hooks/useTargetNamespaces';

import TargetProjectSelect from './TargetProjectSelect';
import type { ProviderTargetProjectSelectProps } from './types';

type RemoteProviderTargetProjectSelectProps = ProviderTargetProjectSelectProps & {
  targetProvider?: V1beta1Provider;
};

const RemoteProviderTargetProjectSelect: FC<RemoteProviderTargetProjectSelectProps> = ({
  targetProvider,
  ...rest
}) => {
  const [targetProjectNames, loaded, error] = useTargetNamespaces(targetProvider);
  return (
    <TargetProjectSelect
      targetProjectNames={targetProjectNames}
      loaded={loaded}
      error={error}
      {...rest}
    />
  );
};
export default RemoteProviderTargetProjectSelect;
