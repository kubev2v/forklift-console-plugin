import { type FC, useContext } from 'react';
import { ListStyleType } from 'src/onlineHelp/utils/types';
import type { ProviderTypes } from 'src/providers/utils/constants';

import { Content } from '@patternfly/react-core';

import { LearningExperienceContext } from '../../learningExperienceDrawer/context/LearningExperienceContext';
import HelpTopicSection from '../HelpTopicSection/HelpTopicSection';

import DescriptionSubTopicRenderer from './components/DescriptionSubTopicRenderer';

const HelpTopic: FC = () => {
  const { data, selectedTopic } = useContext(LearningExperienceContext);

  if (!selectedTopic) {
    return null;
  }

  const providerType = data?.providerType as ProviderTypes | undefined;

  const isDescriptionList = selectedTopic?.subListStyleType === ListStyleType.DESCRIPTIONS;
  const TopicIcon = selectedTopic?.icon;

  return (
    <>
      <Content>
        <Content component="h3">
          <span className="pf-v6-u-mr-sm">
            <TopicIcon />
          </span>
          {selectedTopic.title}
        </Content>
      </Content>
      <div className="pf-v6-u-mt-lg">
        {selectedTopic.subTopics(providerType).map((subTopic, index) => {
          if (isDescriptionList) {
            return <DescriptionSubTopicRenderer key={subTopic.id} subTopic={subTopic} />;
          }

          return (
            <HelpTopicSection
              key={subTopic.id}
              index={index}
              topic={subTopic}
              listStyleType={selectedTopic.subListStyleType}
            />
          );
        })}
      </div>
    </>
  );
};

export default HelpTopic;
