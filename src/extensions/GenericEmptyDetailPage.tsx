import * as React from 'react';

import { HorizontalNav, K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { Level, LevelItem, PageSection, Title } from '@patternfly/react-core';

import { ResourceActions } from './actions';

const GenericEmptyDetailPage = ({
  kind,
  name,
  namespace,
  kindObj,
}: {
  kind: string;
  name: string;
  namespace: string;
  kindObj: K8sModel;
}) => {
  // assume that kind is actually "group~version~kind" i.e.
  // "forklift.konveyor.io~v1beta1~Provider"
  return (
    <>
      <PageSection variant="light">
        <Level>
          <LevelItem>
            <Title headingLevel="h1">{kindObj?.label}</Title>
          </LevelItem>
          <LevelItem>
            <ResourceActions kind={kind} name={name} namespace={namespace} />
          </LevelItem>
        </Level>
      </PageSection>
      <HorizontalNav resource={{ kind }} pages={[]} />
    </>
  );
};

export default GenericEmptyDetailPage;
