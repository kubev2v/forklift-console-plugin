import type { FC } from 'react';

import useWatchProjectNames from '@utils/hooks/useWatchProjectNames';

import TargetProjectSelect from './TargetProjectSelect';
import type { ProviderTargetProjectSelectProps } from './types';

const LocalProviderTargetProjectSelect: FC<ProviderTargetProjectSelectProps> = (props) => {
  const [localProviderProjectNames, loaded, error] = useWatchProjectNames();
  return (
    <TargetProjectSelect
      targetProjectNames={localProviderProjectNames}
      loaded={loaded}
      error={error}
      {...props}
    />
  );
};
export default LocalProviderTargetProjectSelect;
