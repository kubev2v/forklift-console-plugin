import type { FC } from 'react';

import { Alert } from '@patternfly/react-core';

type MappingAlertsProps = {
  alerts: string[];
};
const MappingAlerts: FC<MappingAlertsProps> = ({ alerts }) => {
  return (
    <>
      {alerts.map((alert) => (
        <Alert variant="warning" title={alert} key={alert} />
      ))}
    </>
  );
};

export default MappingAlerts;
