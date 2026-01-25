import type { FC } from 'react';
import Loading from 'src/overview/components/Loading';

import type { V1beta1Provider } from '@kubev2v/types';
import { isEmpty } from '@utils/helpers';
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
  const [projectNames, loaded, loadError] = useTargetNamespaces(targetProvider);

  if (!loaded && isEmpty(loadError)) return <Loading />;

  return (
    <TargetNamespaceSelect
      projectNames={projectNames}
      value={value}
      onChange={onChange}
      errorMessage={loadError?.message}
    />
  );
};

export default RemoteProviderNamespaceSelect;
