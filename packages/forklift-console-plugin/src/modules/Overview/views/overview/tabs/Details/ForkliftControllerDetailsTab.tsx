import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1beta1ForkliftController } from '@kubev2v/types';
import { Grid, GridItem } from '@patternfly/react-core';

import { ConditionsCard, MigrationsCard, OperatorCard, OverviewCard, SettingsCard } from './cards';

interface ForkliftControllerDetailsTabProps extends RouteComponentProps {
  obj: V1beta1ForkliftController;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
}

export const ForkliftControllerDetailsTab: React.FC<ForkliftControllerDetailsTabProps> = ({
  obj,
}) => {
  return (
    <div className="co-dashboard-body">
      <Grid hasGutter>
        <GridItem span={8}>
          <OverviewCard obj={obj} />
        </GridItem>

        <GridItem span={4} rowSpan={5}>
          <SettingsCard obj={obj} />
        </GridItem>

        <GridItem span={8}>
          <MigrationsCard obj={obj} />
        </GridItem>

        <GridItem span={8}>
          <OperatorCard obj={obj} />
        </GridItem>

        <GridItem span={8}>
          <ConditionsCard obj={obj} />
        </GridItem>
      </Grid>
    </div>
  );
};

export default ForkliftControllerDetailsTab;
