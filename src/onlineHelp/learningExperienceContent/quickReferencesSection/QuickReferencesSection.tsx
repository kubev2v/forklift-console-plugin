import type { FC } from 'react';

import { Flex, FlexItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import LearningExperienceFooterSection from '../../learningExperienceStructure/LearningExperiencePanel/components/LearningExperienceFooterSection';

import KeyConsiderationsReferenceSection from './KeyConsiderationsReferenceSection';
import KeyTerminologyReferenceSection from './KeyTerminologyReferenceSection';

const QuickReferencesSection: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <LearningExperienceFooterSection title={t('Quick reference')}>
      <Flex direction={{ default: 'column' }} spacer={{ default: 'spacerMd' }}>
        <FlexItem>
          <KeyTerminologyReferenceSection />
        </FlexItem>
        <FlexItem>
          <KeyConsiderationsReferenceSection />
        </FlexItem>
      </Flex>
    </LearningExperienceFooterSection>
  );
};

export default QuickReferencesSection;
