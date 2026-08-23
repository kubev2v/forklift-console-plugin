import type { FC } from 'react';

import { DescriptionListTerm } from '@patternfly/react-core';

type DescriptionTitleProps = {
  title: string;
};

const DescriptionTitle: FC<DescriptionTitleProps> = ({ title }) => (
  <DescriptionListTerm> {title} </DescriptionListTerm>
);

export default DescriptionTitle;
