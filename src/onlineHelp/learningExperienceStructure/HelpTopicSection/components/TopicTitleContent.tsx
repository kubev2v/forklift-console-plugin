import type { FC, ReactNode } from 'react';
import { ListStyleType } from 'src/onlineHelp/utils/types';

import { Content } from '@patternfly/react-core';

export type TopicTitleProps = {
  title: ReactNode;
  listStyleType?: ListStyleType;
  prefix?: string;
};

export const TopicTitleContent: FC<TopicTitleProps> = ({ listStyleType, prefix, title }) => {
  const isDecimal = listStyleType === ListStyleType.DECIMAL;
  const displayTitle = isDecimal ? (
    <>
      {prefix} {title}
    </>
  ) : (
    title
  );

  return (
    <Content>
      <Content component="p">{displayTitle}</Content>
    </Content>
  );
};
