import React from 'react';
import { ModalHOC } from 'src/modules/Providers/modals';

import type { V1beta1NetworkMap } from '@kubev2v/types';
import { DescriptionList } from '@patternfly/react-core';

import {
  CreatedAtDetailsItem,
  NameDetailsItem,
  NamespaceDetailsItem,
  OwnerDetailsItem,
} from './components';

export const DetailsSection: React.FC<DetailsSectionProps> = (props) => (
  <ModalHOC>
    <DetailsSectionInternal {...props} />
  </ModalHOC>
);

export type DetailsSectionProps = {
  obj: V1beta1NetworkMap;
};

export const DetailsSectionInternal: React.FC<DetailsSectionProps> = ({ obj }) => {
  return (
    <DescriptionList
      columnModifier={{
        default: '1Col',
      }}
    >
      <NameDetailsItem resource={obj} />

      <NamespaceDetailsItem resource={obj} />

      <CreatedAtDetailsItem resource={obj} />

      <OwnerDetailsItem resource={obj} />
    </DescriptionList>
  );
};
