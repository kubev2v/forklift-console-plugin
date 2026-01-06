import type { FC } from 'react';
import HelpTitleDescription from 'src/onlineHelp/learningExperienceStructure/HelpTitleDescription';
import ReferenceSection from 'src/onlineHelp/learningExperienceStructure/ReferenceSection';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { Flex, FlexItem } from '@patternfly/react-core';
import { CatalogIcon } from '@patternfly/react-icons';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

import { keyTerminologyItems } from './keyTerminologyItems';

const highLevelGuideRef =
  'https://cloud.redhat.com/learn/high-level-guide-red-hat-openshift-virtualization-vmware-admin#page-title';

const KeyTerminologyReferenceSection: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <ReferenceSection id="key-terminology" icon={<CatalogIcon />} title={t('Key terminology')}>
      <Flex
        className="pf-v6-u-ml-md"
        direction={{ default: 'column' }}
        spacer={{ default: 'spacerMd' }}
      >
        <FlexItem>
          <ForkliftTrans>
            Coming from VMware and confused by all of these new terms? Check out the{' '}
            <ExternalLink isInline href={highLevelGuideRef}>
              high-level guide to Red Hat OpenShift Virtualization as a VMware admin
            </ExternalLink>
            .
          </ForkliftTrans>
        </FlexItem>
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
