import { type FC, useContext } from 'react';
import { CreateForkliftContext } from 'src/forkliftWrapper/ForkliftContext';
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
import { useForkliftTranslation } from '@utils/i18n';

const HeaderTitle: FC = () => {
  const { loadError: inventoryLivelinessError } = useProvidersInventoryIsLive({});
  const { t } = useForkliftTranslation();
  const { trackEvent } = useForkliftAnalytics();
  const { isLearningExperienceOpen, openLearningExperience } =
    useContext(CreateForkliftContext).learningExperienceContext;

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Split hasGutter style={{ alignItems: 'baseline' }}>
          <SplitItem isFilled>
            <Title headingLevel="h1">{t('Migration Toolkit for Virtualization')}</Title>
          </SplitItem>
          {isLearningExperienceOpen ? undefined : (
            <Button
              variant={ButtonVariant.link}
              isInline
              onClick={() => {
                trackEvent(TELEMETRY_EVENTS.TIPS_AND_TRICKS_CLICKED);
                openLearningExperience();
              }}
            >
              {t('Tips and tricks')}
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
