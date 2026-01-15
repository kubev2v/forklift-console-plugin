import type { FC, ReactNode } from 'react';

import { Content, ContentVariants, Flex, FlexItem } from '@patternfly/react-core';

type LearningExperienceFooterSectionProps = {
  title: string;
  children: ReactNode;
};

const LearningExperienceFooterSection: FC<LearningExperienceFooterSectionProps> = ({
  children,
  title,
}) => {
  return (
    <Flex
      className="forklift--learning__footer-section"
      direction={{ default: 'column' }}
      spacer={{ default: 'spacerMd' }}
    >
      <FlexItem>
        <Content component={ContentVariants.h3}>{title}</Content>
      </FlexItem>
      <FlexItem>{children}</FlexItem>
    </Flex>
  );
};

export default LearningExperienceFooterSection;
