import type { FC } from 'react';
import { useK8sWatchForkliftController } from 'src/overview/hooks/useK8sWatchProviderNames';

import SettingsCard from './cards/SettingsCard';

const ForkliftControllerSettingsTab: FC = () => {
  const [forkliftController] = useK8sWatchForkliftController();
  return (
    <div className="co-dashboard-body">
      <SettingsCard obj={forkliftController} />
    </div>
  );
};

export default ForkliftControllerSettingsTab;
