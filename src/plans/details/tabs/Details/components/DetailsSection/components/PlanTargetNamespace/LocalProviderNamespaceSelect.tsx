import type { FC } from 'react';
import Loading from 'src/components/Loading/Loading';

import { isEmpty } from '@utils/helpers';
import useWatchProjectNames from '@utils/hooks/useWatchProjectNames';

import type { TargetNamespaceSelectInputProps } from './utils/types';
import TargetNamespaceSelect from './TargetNamespaceSelect';

const LocalProviderNamespaceSelect: FC<TargetNamespaceSelectInputProps> = ({ onChange, value }) => {
  const [projectNames, loaded, loadError] = useWatchProjectNames();

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

export default LocalProviderNamespaceSelect;
