import type { FC } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';

import CreatedAtDetailsItem from '@components/DetailItems/CreatedAtDetailItem';
import NameDetailsItem from '@components/DetailItems/NameDetailItem';
import NamespaceDetailsItem from '@components/DetailItems/NamespaceDetailItem';
import OwnerDetailsItem from '@components/DetailItems/OwnerDetailItem';
import type { V1beta1Plan } from '@kubev2v/types';
import { DescriptionList } from '@patternfly/react-core';

import StatusDetailsItem from './StatusDetailsItem';

type DetailsSectionProps = {
  plan: V1beta1Plan;
};

const DetailsSection: FC<DetailsSectionProps> = ({ plan }) => {
  return (
    <ModalHOC>
      <DescriptionList>
        <StatusDetailsItem plan={plan} />
        <NameDetailsItem resource={plan} />
        <NamespaceDetailsItem resource={plan} />
        <CreatedAtDetailsItem resource={plan} />
        <OwnerDetailsItem resource={plan} />
      </DescriptionList>
    </ModalHOC>
  );
};

export default DetailsSection;
