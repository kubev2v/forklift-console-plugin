import type { FC, ReactNode, Ref } from 'react';

import { Card, CardBody, FlexItem } from '@patternfly/react-core';

type ExpandedContentProps = {
  scrollableRef: Ref<HTMLDivElement>;
  children: ReactNode;
};

const ExpandedContent: FC<ExpandedContentProps> = ({ children, scrollableRef }) => (
  <FlexItem>
    <Card className="pf-v6-u-mb-sm" isCompact>
      <CardBody>
        <div ref={scrollableRef} className="forklift--learning__reference-items">
          {children}
        </div>
      </CardBody>
    </Card>
  </FlexItem>
);

export default ExpandedContent;
