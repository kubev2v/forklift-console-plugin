import type { FC } from 'react';
import LearningExperienceFooterSection from 'src/onlineHelp/learningExperienceStructure/LearningExperienceFooterSection';
import ReferenceSection from 'src/onlineHelp/learningExperienceStructure/ReferenceSection';

import { Flex, FlexItem } from '@patternfly/react-core';
import { FlagIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

import KeyTerminologyReferenceSection from './KeyTerminologyReferenceSection';

const QuickReferencesSection: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <LearningExperienceFooterSection title={t('Quick reference')}>
      <Flex direction={{ default: 'column' }} spacer={{ default: 'spacerMd' }}>
        <FlexItem>
          <ReferenceSection
            id="mtv-specific-rules"
            icon={<FlagIcon />}
            title={t('MTV-specific rules')}
          >
            {t('Rules go here')}
          </ReferenceSection>
        </FlexItem>
        <FlexItem>
          <KeyTerminologyReferenceSection />
        </FlexItem>
      </Flex>
    </LearningExperienceFooterSection>
  );
};

export default QuickReferencesSection;
