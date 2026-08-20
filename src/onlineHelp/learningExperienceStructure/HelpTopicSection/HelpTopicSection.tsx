import { type FC, memo, type MouseEvent, useContext } from 'react';
import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { ExpandableSection } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';

import { AccordionContext } from '../../learningExperienceDrawer/context/AccordionContext';

import SubTopicsContent from './components/SubTopicsContent';
import TopicTitle from './components/TopicTitle';

type HelpTopicSectionProps = {
  index: number;
  listStyleType?: ListStyleType;
  topic: LearningExperienceSubTopic;
};

const HelpTopicSection: FC<HelpTopicSectionProps> = ({ index, listStyleType, topic }) => {
  const { closeExpansionItem, openExpansionItem, openExpansionItems } =
    useContext(AccordionContext);

  const isExpanded = openExpansionItems.includes(topic.id);
  const hasSubTopics = Boolean(topic.subTopics);
  const prefix = listStyleType === ListStyleType.DECIMAL ? `${index + 1}.` : undefined;

  const handleToggle = (_ev: MouseEvent, expanded: boolean): void => {
    if (!hasSubTopics) {
      return;
    }

    if (expanded) {
      openExpansionItem(topic.id);
    } else {
      closeExpansionItem(topic.id);
    }
  };

  return (
    <ExpandableSection
      className={css(
        'forklift--learning__help-section',
        !hasSubTopics && 'm-non-expandable',
        topic.subListStyleType === ListStyleType.DESCRIPTIONS && 'm-has-descriptions',
      )}
      contentId={`help-topic-content-${topic.id}`}
      data-testid="help-topic-section"
      isExpanded={isExpanded}
      onToggle={handleToggle}
      toggleContent={
        <div className="pf-v6-u-ml-sm">
          <TopicTitle listStyleType={listStyleType} prefix={prefix} title={topic.title} />
        </div>
      }
      toggleId={`help-topic-toggle-${topic.id}`}
    >
      {hasSubTopics && <SubTopicsContent topic={topic} />}
    </ExpandableSection>
  );
};

export default memo(HelpTopicSection);
