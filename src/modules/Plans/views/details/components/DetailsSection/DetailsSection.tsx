import type { FC } from 'react';

import type { V1beta1Plan } from '@kubev2v/types';
import { DescriptionList } from '@patternfly/react-core';

import { CreatedAtDetailsItem } from './components/CreatedAtDetailsItem';
import { NameDetailsItem } from './components/NameDetailsItem';
import { NamespaceDetailsItem } from './components/NamespaceDetailsItem';
import { OwnerDetailsItem } from './components/OwnerDetailsItem';
import { StatusDetailsItem } from './components/StatusDetailsItem';

type DetailsSectionProps = {
  obj: V1beta1Plan;
};

export const DetailsSection: FC<DetailsSectionProps> = ({ obj }) => {
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
