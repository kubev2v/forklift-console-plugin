import type { FC, ReactNode } from 'react';

import { Content, ContentVariants } from '@patternfly/react-core';

type HelpTitledContentProps = {
  title: ReactNode;
  content: ReactNode;
};

const HelpTitledContent: FC<HelpTitledContentProps> = ({ content, title }) => (
  <Content>
    <Content component={ContentVariants.h4}>{title}</Content>
    <Content component={ContentVariants.p}>{content}</Content>
  </Content>
);

export default HelpTitledContent;
