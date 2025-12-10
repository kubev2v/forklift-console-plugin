import type { FC } from 'react';
import InventoryNotReachable from 'src/modules/Providers/views/list/components/InventoryNotReachable';
import { useProvidersInventoryIsLive } from 'src/overview/hooks/useProvidersInventoryIsLive';

import {
  Button,
  ButtonVariant,
  PageSection,
  Split,
  SplitItem,
  Title,
} from '@patternfly/react-core';
import { TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { TIPS_AND_TRICKS_LABEL } from '@utils/constants';
import { useForkliftTranslation } from '@utils/i18n';

type HeaderTitleProps = {
  isDrawerOpen?: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
};

const HeaderTitle: FC<HeaderTitleProps> = ({ isDrawerOpen = false, setIsDrawerOpen }) => {
  const { loadError: inventoryLivelinessError } = useProvidersInventoryIsLive({});
  const { t } = useForkliftTranslation();
  const { trackEvent } = useForkliftAnalytics();

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Split hasGutter style={{ alignItems: 'baseline' }}>
          <SplitItem isFilled>
            <Title headingLevel="h1">{t('migration toolkit for virtualization')}</Title>
          </SplitItem>
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
        </Split>
      </PageSection>
      {inventoryLivelinessError && (
        <PageSection hasBodyWrapper={false}>
          {[<InventoryNotReachable key="inventoryNotReachable" />]}
        </PageSection>
      )}
    </>
  );
};

export default HeaderTitle;
