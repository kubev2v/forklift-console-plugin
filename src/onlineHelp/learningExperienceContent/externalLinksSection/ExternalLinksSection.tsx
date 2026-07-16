import type { FC } from 'react';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { Flex, FlexItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import LearningExperienceFooterSection from '../../learningExperienceStructure/LearningExperiencePanel/components/LearningExperienceFooterSection';

import { MTV_PRODUCT_PAGE_HREF, OCV_ADMIN_I_COURSE_HREF, SUPPORT_HREF } from './utils/constants';

const ExternalLinksSection: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <LearningExperienceFooterSection title={t('External links')}>
      <Flex direction={{ default: 'column' }} spacer={{ default: 'spacerMd' }}>
        {/* TODO: Restore when AEM documentation migration is complete
        {DOCUMENTATION_HREF && (
          <FlexItem>
            <ExternalLink href={DOCUMENTATION_HREF} iconPosition="start" isInline>
              {t('Documentation')}
            </ExternalLink>
          </FlexItem>
        )}
        {PERFORMANCE_HREF && (
          <FlexItem>
            <ExternalLink href={PERFORMANCE_HREF} iconPosition="start" isInline>
              {t('MTV performance recommendations')}
            </ExternalLink>
          </FlexItem>
        )}
        */}
        <FlexItem>
          <ExternalLink href={MTV_PRODUCT_PAGE_HREF} iconPosition="start" isInline>
            {t('Documentation')}
          </ExternalLink>
        </FlexItem>
        <FlexItem>
          <ExternalLink href={SUPPORT_HREF} iconPosition="start" isInline>
            {t('Get support')}
          </ExternalLink>
        </FlexItem>
        <FlexItem>
          <ExternalLink href={OCV_ADMIN_I_COURSE_HREF} iconPosition="start" isInline>
            {t('Red Hat OpenShift Virtualization Administration I course')}
          </ExternalLink>
        </FlexItem>
      </Flex>
    </LearningExperienceFooterSection>
  );
};

export default ExternalLinksSection;
