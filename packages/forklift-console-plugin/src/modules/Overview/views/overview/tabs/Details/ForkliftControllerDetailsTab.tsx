import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1beta1ForkliftController } from '@kubev2v/types';
import { Grid, GridItem } from '@patternfly/react-core';

import { ChartsCard } from './cards/ChartsCard';
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
        <GridItem lg={8}>
          <OverviewCard obj={obj} />
        </GridItem>

        <GridItem lg={8} xl={4} xlRowSpan={2}>
          <SettingsCard obj={obj} />
        </GridItem>

        <GridItem lg={8} xl={8} xlRowSpan={2}>
          <MigrationsCard obj={obj} />
        </GridItem>

        <GridItem lg={8} xl={8} xl2={4} xl2RowSpan={3}>
          <ChartsCard obj={obj} />
        </GridItem>

        <GridItem lg={8}>
          <OperatorCard obj={obj} />
        </GridItem>

        <GridItem lg={8}>
          <ConditionsCard obj={obj} />
        </GridItem>
      </Grid>
    </div>
  );
};

export default ForkliftControllerDetailsTab;
