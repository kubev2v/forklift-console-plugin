import type { FC, ReactNode } from 'react';

import { PageSection, Split, SplitItem, Title } from '@patternfly/react-core';
type HeaderTitleProps = {
  title: ReactNode;
  badge: ReactNode;
};

const HeaderTitle: FC<HeaderTitleProps> = ({ badge, title }) => {
  return (
    <PageSection variant="light">
      <Split hasGutter style={{ alignItems: 'baseline' }}>
        <SplitItem isFilled>
          <Title headingLevel="h1">{title}</Title>
        </SplitItem>
        {badge && (
          <SplitItem>{<span className="forklift-overview__welcome-badge">{badge}</span>}</SplitItem>
        )}
      </Split>
    </PageSection>
  );
};
export default HeaderTitle;
