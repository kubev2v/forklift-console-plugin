import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { Button, ButtonVariant, Split, SplitItem } from '@patternfly/react-core';

type ProviderIconLinkProps = {
  providerName?: string;
  href: string;
  providerIcon: ReactNode;
};

const ProviderIconLink: FC<ProviderIconLinkProps> = ({ href, providerIcon, providerName }) => {
  const navigate = useNavigate();
  return (
    <Button
      type="button"
      isInline
      variant={ButtonVariant.link}
      onClick={() => {
        navigate(href);
      }}
    >
      <Split>
        <SplitItem className="pf-u-pr-xs">{providerIcon}</SplitItem>
        <SplitItem>{providerName}</SplitItem>
      </Split>
    </Button>
  );
};

export default ProviderIconLink;
