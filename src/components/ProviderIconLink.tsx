import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { Button, ButtonVariant, Split, SplitItem, Truncate } from '@patternfly/react-core';

import './ProviderIconLink.scss';

type ProviderIconLinkProps = {
  providerName?: string;
  href: string;
  providerIcon: ReactNode;
  className?: string;
};

const ProviderIconLink: FC<ProviderIconLinkProps> = ({
  className,
  href,
  providerIcon,
  providerName,
}) => {
  const navigate = useNavigate();
  return (
    <Split className={className}>
      <SplitItem className="forklift-provider-icon-link">{providerIcon}</SplitItem>
      <SplitItem className="forklift-provider-icon-link__name">
        <Button
          type="button"
          isInline
          variant={ButtonVariant.link}
          onClick={() => {
            navigate(href);
          }}
        >
          <Truncate content={providerName ?? ''} />
        </Button>
      </SplitItem>
    </Split>
  );
};

export default ProviderIconLink;
