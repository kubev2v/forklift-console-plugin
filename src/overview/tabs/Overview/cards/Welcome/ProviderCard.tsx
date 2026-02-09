import type { FC, PropsWithChildren, ReactNode } from 'react';

import { Card, CardBody, CardHeader, Flex, FlexItem } from '@patternfly/react-core';

import './ProviderCard.scss';

type ProviderCardProps = PropsWithChildren & {
  image: ReactNode;
  onClick: () => void;
};

export const ProviderCard: FC<ProviderCardProps> = ({ children, image, onClick }) => (
  <Card className="forklift-provider-card" isClickable variant="secondary">
    <CardHeader
      className="pf-v6-u-pb-0"
      selectableActions={{
        onClickAction: onClick,
      }}
    />
    <CardBody>
      <Flex
        justifyContent={{ default: 'justifyContentCenter' }}
        alignItems={{ default: 'alignItemsCenter' }}
        spaceItems={{ default: 'spaceItemsSm' }}
      >
        <FlexItem>{image}</FlexItem>

        <FlexItem>
          <b>{children}</b>
        </FlexItem>
      </Flex>
    </CardBody>
  </Card>
);
