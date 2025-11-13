import type { ReactNode } from 'react';

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
};

export const PageHeader = ({ actionButton, title, titleHelpContent }: PageHeaderProps) => {
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
        {actionButton && <LevelItem>{actionButton}</LevelItem>}
      </Level>
    </PageSection>
  );
};
