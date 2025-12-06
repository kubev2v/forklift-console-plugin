import type { FC } from 'react';

import useWatchProjectNames from '@utils/hooks/useWatchProjectNames';

import type { TargetNamespaceSelectInputProps } from './utils/types';
import TargetNamespaceSelect from './TargetNamespaceSelect';

const LocalProviderNamespaceSelect: FC<TargetNamespaceSelectInputProps> = ({ onChange, value }) => {
  const [projectNames] = useWatchProjectNames();

  return <TargetNamespaceSelect projectNames={projectNames} value={value} onChange={onChange} />;
};

export default LocalProviderNamespaceSelect;
