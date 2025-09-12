import type { FC } from 'react';
import InventoryNotReachable from 'src/modules/Providers/views/list/components/InventoryNotReachable';
import { useProvidersInventoryIsLive } from 'src/overview/hooks/useProvidersInventoryIsLive';

import {
  Button,
  ButtonVariant,
  PageSection,
  PageSectionVariants,
  Split,
  SplitItem,
  Title,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type HeaderTitleProps = {
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
};

const HeaderTitle: FC<HeaderTitleProps> = ({ isDrawerOpen, setIsDrawerOpen }) => {
  const { loadError: inventoryLivelinessError } = useProvidersInventoryIsLive({});
  const { t } = useForkliftTranslation();

  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <Split hasGutter style={{ alignItems: 'baseline' }}>
          <SplitItem isFilled>
            <Title headingLevel="h1">{t('Migration Toolkit for Virtualization')}</Title>
          </SplitItem>
          {isDrawerOpen ? undefined : (
            <Button
              variant={ButtonVariant.link}
              isInline
              onClick={() => {
                setIsDrawerOpen(true);
              }}
            >
              {t('Tips and tricks')}
            </Button>
          )}
        </Split>
      </PageSection>
      {inventoryLivelinessError && (
        <PageSection variant="light">
          {[<InventoryNotReachable key="inventoryNotReachable" />]}
        </PageSection>
      )}
    </>
  );
};

export default HeaderTitle;
