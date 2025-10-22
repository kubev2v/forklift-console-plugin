import type { FC } from 'react';
import { useK8sWatchForkliftController } from 'src/overview/hooks/useK8sWatchForkliftController';

import ConditionsCard from './cards/ConditionsCard';
import ControllerCard from './cards/Controller/ControllerCard';

const ForkliftControllerHealthTab: FC = () => {
  const [forkliftController] = useK8sWatchForkliftController();
  return (
    <div className="co-dashboard-body">
      <div>
        <ControllerCard obj={forkliftController} />
      </div>
      <div className="pf-v5-u-mt-md">
        <ConditionsCard obj={forkliftController} />
      </div>
    </div>
  );
};

export default ForkliftControllerHealthTab;
