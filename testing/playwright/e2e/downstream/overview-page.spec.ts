import { expect, test } from '@playwright/test';

import { OverviewPage, type TopicConfig } from '../../page-objects/OverviewPage';

const TOPICS: TopicConfig[] = [
  {
    name: 'Migrating your virtual machines',
    cardText: 'Migrating your virtual machinesLearn the best practices',
    description: 'Learn the best practices for seamlessly migrating your VMs.',
    accordions: [
      {
        buttonName: '1. Go to Migration plans',
        sampleContent: 'Go to Migration plans',
      },
      {
        buttonName: '2. Click on "Create migration plan".',
        sampleContent: 'Click on "Create migration plan".',
      },
      {
        buttonName: '3. Define your plan details:',
        sampleContent: 'Plan name:',
      },
      {
        buttonName: '4. Select the VMs you want to migrate to:',
        sampleContent: 'Browse or search for the virtual machines',
      },
      {
        buttonName: '5. Select a network map:',
        sampleContent: 'A network map is a configuration',
      },
      {
        buttonName: '6. Select a storage map:',
        sampleContent: 'A storage map is a configuration',
      },
      {
        buttonName: '7. Set a migration type:',
        sampleContent: 'A cold migration moves a shut-down virtual machine',
      },
      {
        buttonName: '8. Set additional settings (optional)',
        sampleContent: 'Disk decryption passphrases',
      },
      {
        buttonName: '9. Review and Create:',
        sampleContent: 'Review all the configured settings',
      },
    ],
  },
  {
    name: 'Choosing the right migration type',
    cardText: 'Choosing the right migration type',
    description: 'Compare migration types to find the best fit for your needs.',
    accordions: [
      {
        buttonName: 'Cold migration',
        sampleContent: 'Downtime is acceptable.',
      },
      {
        buttonName: 'Warm migration',
        sampleContent: 'You must minimize downtime for a critical workload.',
      },
    ],
  },
  {
    name: 'Troubleshooting',
    cardText: 'Troubleshooting',
    description: 'Get quick answers to common problems.',
    accordions: [
      {
        buttonName: '1. Migration progress',
        sampleContent: 'Warm migration:',
      },
      {
        buttonName: '2. Pod logs',
        sampleContent: 'Pod logs contain the details on the status of a specific pod',
      },
      {
        buttonName: '3. Forklift controller logs',
        sampleContent: 'Forklift controller logs capture Migration Toolkit',
      },
      {
        buttonName: "4. 'must-gather' CLI logs",
        sampleContent: 'To use the must-gather tool,',
      },
      {
        buttonName: '5. Support',
        sampleContent: 'If none of these steps helped',
      },
      {
        buttonName:
          'Is the guest operating system of your source VM officially supported by OpenShift Virtualization?',
        sampleContent: 'Check the official list of',
      },
      {
        buttonName:
          'My migration plan is failing with a network-related error. Are the source and destination networks mapped correctly?',
        sampleContent: 'Verify that you have created a network mapping',
      },
      {
        buttonName:
          "My warm migration is failing or getting stuck during the pre-copy stage. What's the problem?",
        sampleContent: 'This often happens when change block tracking',
      },
      {
        buttonName: 'Why don\u2019t my VMs function correctly after a successful migration?',
        sampleContent: 'A common reason VMs do not function properly',
      },
    ],
  },
  {
    name: 'Key terminology',
    cardText: 'Key terminology',
    description: 'Understand OpenShift more with definitions to essential vocabulary.',
    accordions: [
      {
        buttonName: 'Cluster',
        sampleContent: 'A group of hosts running Linux containers',
      },
      {
        buttonName: 'Container',
        sampleContent: 'A unit of software that holds together all the components',
      },
      {
        buttonName: 'Cutover',
        sampleContent: 'When the VM will migrate during a warm migration.',
      },
      {
        buttonName: 'Disk decryption passphrases',
        sampleContent: 'A list of passphrases for the Linux Unified Key Setup',
      },
      {
        buttonName: 'Hook',
        sampleContent: 'A mechanism that triggers an Ansible automation',
      },
      {
        buttonName: 'Kubernetes',
        sampleContent: 'An open-source container orchestration platform',
      },
      {
        buttonName: 'Node',
        sampleContent: 'A virtual or bare-metal machine in a Kubernetes cluster.',
      },
      {
        buttonName: 'Migration types (cold vs warm vs)',
        sampleContent: 'A cold migration moves a shut-down virtual machine',
      },
      {
        buttonName: 'Network map',
        sampleContent: 'A configuration that defines how the networks',
      },
      {
        buttonName: 'Persistent Volume (PV)',
        sampleContent: 'Provides a storage framework to allow administrators',
      },
      {
        buttonName: 'Persistent Volume Claim (PVC)',
        sampleContent: 'Requests persistent volume (PV) resources',
      },
      {
        buttonName: 'Project',
        sampleContent: 'A way to organize clusters into virtual sub-clusters.',
      },
      {
        buttonName: 'Provider',
        sampleContent: 'The repository or virtualization platform you want to migrate',
      },
      {
        buttonName: 'Root device',
        sampleContent: 'The storage device or partition that contains the root filesystem.',
      },
      {
        buttonName: 'Storage map',
        sampleContent: 'A configuration that defines how the storage resources',
      },
    ],
  },
];

test.describe(
  'Overview Page - Tips and Tricks',
  {
    tag: '@downstream',
  },
  () => {
    test('should verify complete Tips and tricks functionality with all expandable content', async ({
      page,
    }) => {
      const overviewPage = new OverviewPage(page);

      // SETUP: Navigate to Overview page and dismiss tour
      await page.goto('/mtv/overview');
      await page.waitForLoadState('networkidle');
      await overviewPage.dismissTourDialog();
      await expect(overviewPage.pageTitle).toBeVisible();

      // STEP 1: Navigate to Tips and Tricks and Verify All Topics Present
      const { drawerTitle, closeDrawerButton } = await overviewPage.openTipsAndTricksDrawer();
      await overviewPage.verifyTopicCards(TOPICS);
      await overviewPage.verifyPicklist(TOPICS);

      // STEP 2: Test All Topics and Expandable Sections
      for (let i = 0; i < TOPICS.length; i += 1) {
        const topic = TOPICS[i];

        // Select topic (first via card, remaining via dropdown)
        if (i === 0) {
          await overviewPage.selectTopicByCard(topic);
        } else {
          const previousTopic = TOPICS[i - 1];
          await overviewPage.navigateToNextTopic(previousTopic.name, topic.name);
          await overviewPage.verifyTopicHeading(topic.name);
        }

        // For each expandable section: expand, verify content, collapse
        // eslint-disable-next-line no-restricted-syntax
        if (topic.accordions.length > 0) {
          await overviewPage.testAllAccordions(topic.accordions);
        }
      }

      // STEP 3: Verify Drawer Close Functionality
      await closeDrawerButton.click();
      await expect(drawerTitle).not.toBeVisible();
    });
  },
);
