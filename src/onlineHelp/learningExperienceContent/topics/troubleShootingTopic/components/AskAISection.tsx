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
import { useLightspeed } from '@utils/hooks/useLightspeed';
import { useForkliftTranslation } from '@utils/i18n';

import AskAIIcon from './AskAIIcon';

const PRE_CANNED_QUESTIONS = [
  'How do I check network mapping for a failed migration?',
  'Why is my warm migration stuck?',
  "Why aren't my VMs working after migration?",
] as const;

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
          <ExpandableSectionToggle
            isExpanded={isExpanded}
            onToggle={(expanded) => {
              setIsExpanded(expanded);
            }}
          >
            {t('Common troubleshooting questions')}
          </ExpandableSectionToggle>
        </Flex>

        <ExpandableSection isDetached isExpanded={isExpanded}>
          <List style={{ '--pf-v6-c-list--Gap': 0 } as React.CSSProperties}>
            {PRE_CANNED_QUESTIONS.map((question) => (
              <ListItem key={question}>
                <Button
                  onClick={() => {
                    openLightspeed(t(question));
                  }}
                  variant={ButtonVariant.link}
                >
                  {t(question)}
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
