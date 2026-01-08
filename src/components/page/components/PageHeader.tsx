import type { ReactNode } from 'react';
import LearningExperienceButton from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceButton';

import {
  Flex,
  FlexItem,
  Icon,
  Level,
  LevelItem,
  PageSection,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

type PageHeaderProps = {
  title?: string;
  titleHelpContent?: ReactNode;
  actionButton?: JSX.Element;
  shouldShowLearningExperienceButton?: boolean;
};

export const PageHeader = ({
  actionButton,
  shouldShowLearningExperienceButton = false,
  title,
  titleHelpContent,
}: PageHeaderProps) => {
  if (!title) {
    return null;
  }

  return (
    <PageSection hasBodyWrapper={false} className="forklift-page__main-title">
      <Level>
        <LevelItem>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            spaceItems={{ default: 'spaceItemsSm' }}
          >
            <FlexItem>
              <Title headingLevel="h1">{title}</Title>
            </FlexItem>
            {titleHelpContent && (
              <FlexItem>
                <Tooltip content={titleHelpContent}>
                  <Icon size="md">
                    <HelpIcon />
                  </Icon>
                </Tooltip>
              </FlexItem>
            )}
          </Flex>
        </LevelItem>
        <LevelItem>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            spaceItems={{ default: 'spaceItemsMd' }}
          >
            {shouldShowLearningExperienceButton && (
              <FlexItem>
                <LearningExperienceButton />
              </FlexItem>
            )}
            {actionButton && <FlexItem>{actionButton}</FlexItem>}
          </Flex>
        </LevelItem>
      </Level>
    </PageSection>
  );
};
