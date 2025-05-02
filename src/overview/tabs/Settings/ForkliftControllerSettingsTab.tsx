import type { FC } from 'react';

import type { V1beta1ForkliftController } from '@kubev2v/types';

import SettingsCard from './cards/SettingsCard';

type ForkliftControllerSettingsTabProps = {
  obj?: V1beta1ForkliftController;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
};

const ForkliftControllerSettingsTab: FC<ForkliftControllerSettingsTabProps> = ({ obj }) => {
  return (
    <div className="co-dashboard-body">
      <SettingsCard obj={obj} />
    </div>
  );
};

export default ForkliftControllerSettingsTab;
