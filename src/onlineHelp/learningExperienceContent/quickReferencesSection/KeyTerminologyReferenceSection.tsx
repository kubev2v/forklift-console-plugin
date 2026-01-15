import type { FC } from 'react';

import { Flex, FlexItem } from '@patternfly/react-core';
import { CatalogIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

import HelpTitleDescription from '../../components/HelpTitleDescription';
import ReferenceSection from '../../learningExperienceStructure/ReferenceSection/ReferenceSection';

import { keyTerminologyItems } from './keyTerminologyItems';

const KeyTerminologyReferenceSection: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <ReferenceSection id="key-terminology" icon={<CatalogIcon />} title={t('Key terminology')}>
      <Flex
        className="pf-v6-u-ml-md"
        direction={{ default: 'column' }}
        spacer={{ default: 'spacerMd' }}
      >
        {keyTerminologyItems.map((item) => (
          <FlexItem key={item.title}>
            <HelpTitleDescription title={item.title} description={item.description} />
          </FlexItem>
        ))}
      </Flex>
    </ReferenceSection>
  );
};

export default KeyTerminologyReferenceSection;
