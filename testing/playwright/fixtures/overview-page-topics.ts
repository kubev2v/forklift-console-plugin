import type { TopicConfig } from '../page-objects/OverviewPage';

// Topic cards shown in Tips and tricks drawer (from learningExperienceTopics)
export const TIPS_AND_TRICKS_TOPICS: TopicConfig[] = [
  {
    name: 'Creating a provider',
    description: 'Step-by-step instructions for creating a provider.',
    minimumAccordions: 3,
  },
  {
    name: 'Migrating your virtual machines',
    description: 'Learn the best practices for seamlessly migrating your virtual machines.',
    minimumAccordions: 9,
  },
  {
    name: 'Choosing the right migration type',
    description: 'Compare migration types to find the best fit for your needs.',
    minimumAccordions: 2,
  },
  {
    name: 'Creating a network mapping',
    description: 'Define how virtual networks connect in the target environment during migration.',
    minimumAccordions: 3,
  },
  {
    name: 'Creating a storage mapping',
    description: 'Set up storage to ensure smooth and efficient VM migration.',
    minimumAccordions: 3,
  },
  {
    name: 'Optimizing migration speed',
    description: 'Accelerate your VM migrations with expert recommendations.',
    minimumAccordions: 3,
  },
  {
    name: 'Troubleshooting',
    description: 'Get quick answers to common problems.',
    minimumAccordions: 5,
  },
];
