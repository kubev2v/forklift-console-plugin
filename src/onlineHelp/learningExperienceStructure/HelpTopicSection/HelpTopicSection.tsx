import { type FC, memo, useContext } from 'react';
import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { ExpandableSection } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';

import { AccordionContext } from '../../learningExperienceDrawer/context/AccordionContext';

import SubTopicsContent from './components/SubTopicsContent';
import TopicTitle from './components/TopicTitle';

type HelpTopicSectionProps = {
  topic: LearningExperienceSubTopic;
  index: number;
  listStyleType?: ListStyleType;
};

const HelpTopicSection: FC<HelpTopicSectionProps> = ({ index, listStyleType, topic }) => {
  const { closeExpansionItem, openExpansionItem, openExpansionItems } =
    useContext(AccordionContext);

  const isExpanded = openExpansionItems.includes(topic.id);
  const hasSubTopics = Boolean(topic.subTopics);
  const prefix = listStyleType === ListStyleType.DECIMAL ? `${index + 1}.` : undefined;

  const handleToggle = (_ev: React.MouseEvent, expanded: boolean) => {
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
      data-testid="help-topic-section"
      className={css(
        'forklift--learning__help-section',
        !hasSubTopics && 'm-non-expandable',
        topic.subListStyleType === ListStyleType.DESCRIPTIONS && 'm-has-descriptions',
      )}
      contentId={`help-topic-content-${topic.id}`}
      toggleId={`help-topic-toggle-${topic.id}`}
      toggleContent={
        <div className="pf-v6-u-ml-sm">
          <TopicTitle title={topic.title} listStyleType={listStyleType} prefix={prefix} />
        </div>
      }
      isExpanded={isExpanded}
      onToggle={handleToggle}
    >
      {hasSubTopics && <SubTopicsContent topic={topic} />}
    </ExpandableSection>
  );
};

export default memo(HelpTopicSection);
