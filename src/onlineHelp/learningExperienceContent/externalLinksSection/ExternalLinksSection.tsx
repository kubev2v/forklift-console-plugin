import type { FC } from 'react';
import LearningExperienceFooterSection from 'src/onlineHelp/learningExperienceStructure/LearningExperienceFooterSection';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { Flex, FlexItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

const documentationHref =
  'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.0/html/installing_and_using_the_migration_toolkit_for_virtualization/about-mtv_mtv';
const performanceHref =
  'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.7/html/installing_and_using_the_migration_toolkit_for_virtualization/mtv-performance-recommendation_mtv';
const supportHref = 'https://access.redhat.com/support/cases/#/case/new/open-case?caseCreate=true';

const ExternalLinksSection: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <LearningExperienceFooterSection title={t('External links')}>
      <Flex direction={{ default: 'column' }} spacer={{ default: 'spacerMd' }}>
        <FlexItem>
          <ExternalLink href={documentationHref} iconPosition="start" isInline>
            {t('Documentation')}
          </ExternalLink>
        </FlexItem>
        <FlexItem>
          <ExternalLink href={performanceHref} iconPosition="start" isInline>
            {t('MTV performance recommendations')}
          </ExternalLink>
        </FlexItem>
        <FlexItem>
          <ExternalLink href={supportHref} iconPosition="start" isInline>
            {t('Get support')}
          </ExternalLink>
        </FlexItem>
      </Flex>
    </LearningExperienceFooterSection>
  );
};

export default ExternalLinksSection;
