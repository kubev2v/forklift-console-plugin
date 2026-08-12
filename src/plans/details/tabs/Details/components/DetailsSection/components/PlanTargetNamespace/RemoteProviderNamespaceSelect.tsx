import type { FC } from 'react';
import Loading from 'src/components/Loading/Loading';

import type { V1beta1Provider } from '@forklift-ui/types';
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

  if (!loaded && isEmpty(loadError)) {
    return <Loading />;
  }

  return (
    <TargetNamespaceSelect
      errorMessage={loadError?.message}
      onChange={onChange}
      projectNames={projectNames}
      value={value}
    />
  );
};

export default RemoteProviderNamespaceSelect;
