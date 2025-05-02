import type { FC } from 'react';

import type { V1beta1ForkliftController } from '@kubev2v/types';

import ConditionsCard from './cards/ConditionsCard';
import ControllerCard from './cards/ControllerCard';

type ForkliftControllerHealthTabProps = {
  obj?: V1beta1ForkliftController;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
};

const ForkliftControllerHealthTab: FC<ForkliftControllerHealthTabProps> = ({ obj }) => {
  return (
    <div className="co-dashboard-body">
      <div>
        <ControllerCard obj={obj} />
      </div>
      <div className="pf-u-mt-md">
        <ConditionsCard obj={obj} />
      </div>
    </div>
  );
};

export default ForkliftControllerHealthTab;
