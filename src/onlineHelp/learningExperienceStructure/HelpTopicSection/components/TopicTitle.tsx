import type { FC } from 'react';
import { ListStyleType } from 'src/onlineHelp/utils/types';

import { Content } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import { getClassForListStyle } from '../../../utils/utils';

import { TopicTitleContent, type TopicTitleProps } from './TopicTitleContent';

const TopicTitle: FC<TopicTitleProps> = ({ listStyleType, prefix, title }) => {
  const titleContent = (
    <TopicTitleContent title={title} listStyleType={listStyleType} prefix={prefix} />
  );

  const hasNoListStyle = isEmpty(listStyleType);
  const isDecimal = listStyleType === ListStyleType.DECIMAL;

  if (hasNoListStyle || isDecimal) {
    return titleContent;
  }

  const listComponent = listStyleType === ListStyleType.LOWER_ALPHA ? 'ol' : 'ul';

  return (
    <div className={getClassForListStyle(listStyleType)}>
      <Content component={listComponent}>
        <Content component="li">{titleContent}</Content>
      </Content>
    </div>
  );
};

export default TopicTitle;
