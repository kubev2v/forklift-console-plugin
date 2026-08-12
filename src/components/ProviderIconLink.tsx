import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { Button, ButtonVariant, Split, SplitItem, Truncate } from '@patternfly/react-core';

import './ProviderIconLink.scss';

type ProviderIconLinkProps = {
  className?: string;
  href: string;
  providerIcon: ReactNode;
  providerName?: string;
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
          isInline
          onClick={() => {
            navigate(href)?.catch(() => undefined);
          }}
          type="button"
          variant={ButtonVariant.link}
        >
          <Truncate content={providerName ?? ''} />
        </Button>
      </SplitItem>
    </Split>
  );
};

export default ProviderIconLink;
