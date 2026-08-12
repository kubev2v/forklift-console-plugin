import type { FC } from 'react';
import Loading from 'src/components/Loading/Loading';

import { isEmpty } from '@utils/helpers';
import useWatchProjectNames from '@utils/hooks/useWatchProjectNames';

import type { TargetNamespaceSelectInputProps } from './utils/types';
import TargetNamespaceSelect from './TargetNamespaceSelect';

const LocalProviderNamespaceSelect: FC<TargetNamespaceSelectInputProps> = ({ onChange, value }) => {
  const [projectNames, loaded, loadError] = useWatchProjectNames();

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

export default LocalProviderNamespaceSelect;
