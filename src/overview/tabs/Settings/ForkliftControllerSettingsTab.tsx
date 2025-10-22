import { type FC, Suspense } from 'react';
import Loading from 'src/overview/components/Loading';
import { useK8sWatchForkliftController } from 'src/overview/hooks/useK8sWatchForkliftController';

import { Bullseye } from '@patternfly/react-core';

import SettingsCard from './cards/SettingsCard';

const ForkliftControllerSettingsTab: FC = () => {
  const [forkliftController, controllerLoaded, controllerLoadError] =
    useK8sWatchForkliftController();
  return (
    <div className="co-dashboard-body">
      <Suspense
        fallback={
          <Bullseye>
            <Loading />
          </Bullseye>
        }
      >
        {forkliftController && controllerLoaded && !controllerLoadError && (
          <SettingsCard obj={forkliftController} />
        )}
      </Suspense>
    </div>
  );
};

export default ForkliftControllerSettingsTab;
