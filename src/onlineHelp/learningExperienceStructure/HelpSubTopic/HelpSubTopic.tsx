import type { FC } from 'react';
import type { LearningExperienceSubTopic } from 'src/onlineHelp/utils/types';

import ListItemWrapper from './components/ListItemWrapper';
import NestedSubTopics from './components/NestedSubTopics';

type HelpSubTopicProps = {
  topic: LearningExperienceSubTopic;
  noListItem?: boolean;
};

const HelpSubTopic: FC<HelpSubTopicProps> = ({ noListItem = false, topic }) => {
  const hasSubTopics = Boolean(topic.subTopics);

  return (
    <ListItemWrapper noListItem={noListItem}>
      {topic.title}
      {hasSubTopics && <NestedSubTopics topic={topic} />}
    </ListItemWrapper>
  );
};

export default HelpSubTopic;
