import type { FC, ReactNode } from 'react';

import { Text, TextContent, TextVariants } from '@patternfly/react-core';

type HelpTitledContentProps = {
  title: ReactNode;
  content: ReactNode;
};

const HelpTitledContent: FC<HelpTitledContentProps> = ({ content, title }) => (
  <TextContent>
    <Text component={TextVariants.h4}>{title}</Text>
    <Text component={TextVariants.p}>{content}</Text>
  </TextContent>
);

export default HelpTitledContent;
