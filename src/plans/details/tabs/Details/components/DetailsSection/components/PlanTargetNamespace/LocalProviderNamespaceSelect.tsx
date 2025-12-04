import type { FC } from 'react';
import Loading from 'src/overview/components/Loading';

import useWatchProjectNames from '@utils/hooks/useWatchProjectNames';

import type { TargetNamespaceSelectInputProps } from './utils/types';
import TargetNamespaceSelect from './TargetNamespaceSelect';

const LocalProviderNamespaceSelect: FC<TargetNamespaceSelectInputProps> = ({ onChange, value }) => {
  const [projectNames, loaded, loadError] = useWatchProjectNames();

  if (!loaded && !loadError) return <Loading />;

  return (
    <TargetNamespaceSelect
      projectNames={projectNames}
      value={value}
      onChange={onChange}
      errorMessage={loadError?.message}
    />
  );
};

export default LocalProviderNamespaceSelect;
