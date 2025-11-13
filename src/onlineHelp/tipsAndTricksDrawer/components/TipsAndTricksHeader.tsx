import type { FC } from 'react';

import { Button, ButtonVariant, Flex, FlexItem, PageSection } from '@patternfly/react-core';
import { TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { TIPS_AND_TRICKS_LABEL } from '@utils/constants';

type TipsAndTricksHeaderProps = {
  isDrawerOpen?: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
};

const TipsAndTricksHeader: FC<TipsAndTricksHeaderProps> = ({
  isDrawerOpen = false,
  setIsDrawerOpen,
}) => {
  const { trackEvent } = useForkliftAnalytics();

  return (
    <PageSection hasBodyWrapper={false}>
      <Flex>
        <FlexItem align={{ default: 'alignRight' }}>
          {isDrawerOpen ? undefined : (
            <Button
              variant={ButtonVariant.link}
              isInline
              onClick={() => {
                trackEvent(TELEMETRY_EVENTS.TIPS_AND_TRICKS_CLICKED);
                setIsDrawerOpen(true);
              }}
            >
              {TIPS_AND_TRICKS_LABEL}
            </Button>
          )}
        </FlexItem>
      </Flex>
    </PageSection>
  );
};

export default TipsAndTricksHeader;
