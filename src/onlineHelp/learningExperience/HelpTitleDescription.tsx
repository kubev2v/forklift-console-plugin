import type { FC, ReactNode } from 'react';

import { Content, ContentVariants } from '@patternfly/react-core';

type HelpTitleDescriptionProps = {
  title: string;
  description: ReactNode;
};

const HelpTitleDescription: FC<HelpTitleDescriptionProps> = ({ description, title }) => (
  <>
    <Content component={ContentVariants.h4}>{title}</Content>
    <div>{description}</div>
  </>
);

export default HelpTitleDescription;
