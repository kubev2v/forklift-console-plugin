import type { FC, ReactNode } from 'react';

import { Card, CardBody, CardHeader, Flex, FlexItem } from '@patternfly/react-core';

import './ProviderCard.scss';

type ProviderCardProps = {
  image: ReactNode;
  onClick: () => void;
  title: string;
};

export const ProviderCard: FC<ProviderCardProps> = ({ image, onClick, title }) => (
  <Card className="forklift-provider-card" isClickable variant="secondary">
    <CardHeader
      className="pf-v6-u-pb-0"
      selectableActions={{
        onClickAction: onClick,
        selectableActionAriaLabel: title,
      }}
    />
    <CardBody>
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        justifyContent={{ default: 'justifyContentCenter' }}
        spaceItems={{ default: 'spaceItemsSm' }}
      >
        <FlexItem>{image}</FlexItem>

        <FlexItem>
          <b>{title}</b>
        </FlexItem>
      </Flex>
    </CardBody>
  </Card>
);
