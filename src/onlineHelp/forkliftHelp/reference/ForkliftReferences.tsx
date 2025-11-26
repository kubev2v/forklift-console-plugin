import type { FC } from 'react';
import LearningExperienceFooterSection from 'src/onlineHelp/learningExperience/LearningExperienceFooterSection';
import ReferenceSection from 'src/onlineHelp/learningExperience/ReferenceSection';

import { Flex, FlexItem } from '@patternfly/react-core';
import { FlagIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

import KeyTerminologyReferenceSection from './KeyTerminologyReferenceSection';

const ForkliftReferences: FC = () => {
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
            Rules go here
          </ReferenceSection>
        </FlexItem>
        <FlexItem>
          <KeyTerminologyReferenceSection />
        </FlexItem>
      </Flex>
    </LearningExperienceFooterSection>
  );
};

export default ForkliftReferences;
