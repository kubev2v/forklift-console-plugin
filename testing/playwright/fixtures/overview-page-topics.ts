import type { TopicConfig } from '../page-objects/OverviewPage';

export const TIPS_AND_TRICKS_TOPICS: TopicConfig[] = [
  {
    name: 'Migrating your virtual machines',
    description: 'Learn the best practices for seamlessly migrating your VMs.',
    minimumAccordions: 9,
  },
  {
    name: 'Choosing the right migration type',
    description: 'Compare migration types to find the best fit for your needs.',
    minimumAccordions: 2,
  },
  {
    name: 'Troubleshooting',
    description: 'Get quick answers to common problems.',
    minimumAccordions: 5,
  },
  {
    name: 'Key terminology',
    description: 'Understand OpenShift more with definitions to essential vocabulary.',
    minimumAccordions: 10,
  },
];
