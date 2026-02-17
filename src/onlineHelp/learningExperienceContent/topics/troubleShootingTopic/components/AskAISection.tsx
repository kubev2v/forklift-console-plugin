import { type FC, useState } from 'react';

import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  ExpandableSection,
  ExpandableSectionToggle,
  Flex,
  List,
  ListItem,
  Title,
} from '@patternfly/react-core';
import { useLightspeed } from '@utils/hooks/useLightspeed/useLightspeed';
import { useForkliftTranslation } from '@utils/i18n';

import AskAIIcon from './AskAIIcon';
import { aiPromptQuestions } from './constants';

const AskAISection: FC = () => {
  const { t } = useForkliftTranslation();
  const { isAvailable, isLoading, openLightspeed } = useLightspeed();
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading || !isAvailable) {
    return null;
  }

  return (
    <Card className="forklift--learning__ask-ai-card pf-v6-u-mt-md" isCompact>
      <CardBody>
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          direction={{ default: 'column' }}
          spaceItems={{ default: 'spaceItemsSm' }}
        >
          <AskAIIcon />
          <Title headingLevel="h4">{t('Ask AI assistant')}</Title>
          <ExpandableSectionToggle isExpanded={isExpanded} onToggle={setIsExpanded}>
            {t('Common troubleshooting questions')}
          </ExpandableSectionToggle>
        </Flex>

        <ExpandableSection isDetached isExpanded={isExpanded}>
          <List>
            {aiPromptQuestions.map((question) => (
              <ListItem key={question}>
                <Button
                  onClick={() => {
                    openLightspeed(question);
                  }}
                  variant={ButtonVariant.link}
                >
                  {question}
                </Button>
              </ListItem>
            ))}
          </List>
        </ExpandableSection>
      </CardBody>
    </Card>
  );
};

export default AskAISection;
