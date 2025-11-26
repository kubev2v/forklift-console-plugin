import type { FC, ReactNode } from 'react';

import { Content, ContentVariants } from '@patternfly/react-core';

type HelpTitledContentProps = {
  title: ReactNode;
  content: ReactNode;
};

const HelpSubTopicTitle: FC<HelpTitledContentProps> = ({ content, title }) => (
  <Content component={ContentVariants.p}>
    <strong>{title}</strong> {content}
  </Content>
);

export default HelpSubTopicTitle;
