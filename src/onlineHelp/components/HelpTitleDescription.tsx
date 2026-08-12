import type { FC, ReactNode } from 'react';

import { Content, ContentVariants } from '@patternfly/react-core';

type HelpTitleDescriptionProps = {
  description: ReactNode;
  title: string;
};

const HelpTitleDescription: FC<HelpTitleDescriptionProps> = ({ description, title }) => (
  <>
    <Content component={ContentVariants.h4}>{title}</Content>
    <div>{description}</div>
  </>
);

export default HelpTitleDescription;
