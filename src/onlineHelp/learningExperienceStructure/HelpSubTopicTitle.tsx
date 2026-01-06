import type { FC, ReactNode } from 'react';

import { Content, ContentVariants } from '@patternfly/react-core';

type HelpSubTopicTitleProps = {
  title: ReactNode;
  content: ReactNode;
};

const HelpSubTopicTitle: FC<HelpSubTopicTitleProps> = ({ content, title }) => (
  <Content component={ContentVariants.p}>
    <strong>{title}</strong> {content}
  </Content>
);

export default HelpSubTopicTitle;
