import type { FC, PropsWithChildren } from 'react';

import { Card, CardBody, CardHeader, Flex, FlexItem } from '@patternfly/react-core';

import './ProviderCard.scss';

type ProviderCardProps = PropsWithChildren & {
  imageSrc: string;
  onClick: () => void;
};

export const ProviderCard: FC<ProviderCardProps> = ({ children, imageSrc, onClick }) => (
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
        <FlexItem>
          <img alt="" src={imageSrc} />
        </FlexItem>

        <FlexItem>
          <b>{children}</b>
        </FlexItem>
      </Flex>
    </CardBody>
  </Card>
);
