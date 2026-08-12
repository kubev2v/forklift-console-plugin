import type { FC } from 'react';

import useWatchProjectNames from '@utils/hooks/useWatchProjectNames';

import TargetProjectSelect from './TargetProjectSelect';
import type { ProviderTargetProjectSelectProps } from './types';

const LocalProviderTargetProjectSelect: FC<ProviderTargetProjectSelectProps> = (props) => {
  const [localProviderProjectNames, loaded, error] = useWatchProjectNames();
  return (
    <TargetProjectSelect
      error={error}
      loaded={loaded}
      targetProjectNames={localProviderProjectNames}
      {...props}
    />
  );
};
export default LocalProviderTargetProjectSelect;
