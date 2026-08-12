import type { FC, ReactNode } from 'react';

import { Content, ContentVariants } from '@patternfly/react-core';

type HelpTitledContentProps = {
  content: ReactNode;
  title: ReactNode;
};

const HelpTitledContent: FC<HelpTitledContentProps> = ({ content, title }) => (
  <Content>
    <strong>{title}</strong>
    <Content component={ContentVariants.p}>{content}</Content>
  </Content>
);

export default HelpTitledContent;
