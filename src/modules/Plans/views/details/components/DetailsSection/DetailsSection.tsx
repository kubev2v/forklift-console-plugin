import React from 'react';

import type { V1beta1Plan } from '@kubev2v/types';
import { DescriptionList } from '@patternfly/react-core';

import {
  CreatedAtDetailsItem,
  NameDetailsItem,
  NamespaceDetailsItem,
  OwnerDetailsItem,
  StatusDetailsItem,
} from './components';

export type DetailsSectionProps = {
  obj: V1beta1Plan;
};

export const DetailsSection: React.FC<DetailsSectionProps> = ({ obj }) => {
  return (
    <DescriptionList
      className="forklift-page-section--details-status"
      columnModifier={{
        default: '1Col',
      }}
    >
      <StatusDetailsItem resource={obj} />

      <NameDetailsItem resource={obj} />

      <NamespaceDetailsItem resource={obj} />

      <CreatedAtDetailsItem resource={obj} />

      <OwnerDetailsItem resource={obj} />
    </DescriptionList>
  );
};
