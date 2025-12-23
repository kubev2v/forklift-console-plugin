import type { FC } from 'react';

import { PageSection, PageSectionTypes, Stack, Title } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import TipsAndTricksDrawer from '../../onlineHelp/tipsAndTricksDrawer/TipsAndTricksDrawer';

import CreateProviderForm from './CreateProviderForm';

const ProvidersCreateFormPage: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <TipsAndTricksDrawer>
      <PageSection hasBodyWrapper={false}>
        <Stack hasGutter>
          <Title headingLevel="h1" size="2xl">
            {t('Create provider')}
          </Title>

          <p className="pf-v6-u-text-color-subtle">
            {t(
              'Define the connection attributes the migration toolkit for virtualization needs to interact with your source and target providers.',
            )}
          </p>
        </Stack>
      </PageSection>

      <PageSection
        hasBodyWrapper={false}
        hasOverflowScroll
        type={PageSectionTypes.default}
        className="pf-v6-u-flex-grow-1"
      >
        <CreateProviderForm />
      </PageSection>
    </TipsAndTricksDrawer>
  );
};

export default ProvidersCreateFormPage;
