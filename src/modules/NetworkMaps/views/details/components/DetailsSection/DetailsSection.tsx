import type { FC } from 'react';

import CreatedAtDetailsItem from '@components/DetailItems/CreatedAtDetailItem';
import NameDetailsItem from '@components/DetailItems/NameDetailItem';
import NamespaceDetailsItem from '@components/DetailItems/NamespaceDetailItem';
import OwnerDetailsItem from '@components/DetailItems/OwnerDetailItem';
import type { V1beta1NetworkMap } from '@kubev2v/types';
import { DescriptionList } from '@patternfly/react-core';

type DetailsSectionProps = {
  obj: V1beta1NetworkMap;
};

const DetailsSection: FC<DetailsSectionProps> = ({ obj }) => {
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

export default DetailsSection;
