import React, { FC } from 'react';
import { Trans } from 'react-i18next';
import automationIcon from 'src/modules/Overview/images/automation.svg';
import { useForkliftTranslation } from 'src/utils/i18n';

import { V1beta1ForkliftController } from '@kubev2v/types';
import { Card, CardBody, Split, SplitItem, Text, TextVariants } from '@patternfly/react-core';

type OverviewCardProps = {
  obj?: V1beta1ForkliftController;
  loaded?: boolean;
  loadError?: unknown;
};

export const OverviewCard: FC<OverviewCardProps> = () => {
  const { t } = useForkliftTranslation();

  return (
    <Card>
      <CardBody>
        <Split>
          <SplitItem>
            <img src={automationIcon} className="forklift-welcome__icon" />
          </SplitItem>
          <SplitItem>
            <Text component={TextVariants.h3}>{t('Welcome')}</Text>
            <Text className="forklift-welcome-text">
              <Trans t={t} ns="plugin__forklift-console-plugin">
                Migration Toolkit for Virtualization (MTV) migrates virtual machines at scale to Red
                Hat OpenShift Virtualization. You can migrate virtual machines from VMware vSphere,
                Red Hat Virtualization, OpenStack, OVA and OpenShift Virtualization source providers
                to OpenShift Virtualization with the Migration Toolkit for Virtualization (MTV).
              </Trans>
            </Text>
            <Text className="forklift-welcome-text">
              <Trans t={t} ns="plugin__forklift-console-plugin">
                This gives organizations the ability to more easily access workloads running on
                virtual machines, while developing new cloud-native applications.
              </Trans>
            </Text>
            <Text className="forklift-welcome-text">
              <Trans t={t} ns="plugin__forklift-console-plugin">
                Migrations are performed in a few simple steps, first by providing source and
                destination credentials, then mapping the source and destination infrastructure and
                creating a choreographed plan, and finally, executing the migration effort.
              </Trans>
            </Text>
          </SplitItem>
        </Split>
      </CardBody>
    </Card>
  );
};

export default OverviewCard;
