import type { FC, ReactNode } from 'react';

import { Content, ContentVariants, Flex, FlexItem } from '@patternfly/react-core';

type AlertSummaryItemProps = {
  count: number;
  icon: ReactNode;
  label: string;
};

const AlertSummaryItem: FC<AlertSummaryItemProps> = ({ count, icon, label }) => (
  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
    <FlexItem>
      <Content component={ContentVariants.small}>{label}</Content>
    </FlexItem>
    <FlexItem>
      <Flex spaceItems={{ default: 'spaceItemsXs' }} alignItems={{ default: 'alignItemsCenter' }}>
        <FlexItem>{icon}</FlexItem>
        <FlexItem>
          <span className="migration-alerts-card__summary-count">{count}</span>
        </FlexItem>
      </Flex>
    </FlexItem>
  </Flex>
);

export default AlertSummaryItem;
