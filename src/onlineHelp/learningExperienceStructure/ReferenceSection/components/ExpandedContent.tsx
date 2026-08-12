import type { FC, ReactNode, Ref } from 'react';

import { Card, CardBody, FlexItem } from '@patternfly/react-core';

type ExpandedContentProps = {
  children: ReactNode;
  scrollableRef: Ref<HTMLDivElement>;
};

const ExpandedContent: FC<ExpandedContentProps> = ({ children, scrollableRef }) => (
  <FlexItem>
    <Card className="pf-v6-u-mb-sm" isCompact>
      <CardBody>
        <div className="forklift--learning__reference-items" ref={scrollableRef}>
          {children}
        </div>
      </CardBody>
    </Card>
  </FlexItem>
);

export default ExpandedContent;
