import type { TopicConfig } from '../page-objects/OverviewPage/OverviewPage';

// Provider types available in the "Creating a provider" topic
export const PROVIDER_TYPES = {
  OPENSHIFT_VIRT: 'OpenShift Virtualization',
  OPENSTACK: 'OpenStack',
  OVA: 'Open Virtual Appliances',
  RHV: 'Red Hat Virtualization',
  VMWARE: 'VMware vSphere',
} as const;

export const PROVIDER_TYPES_LIST = Object.values(PROVIDER_TYPES);

// Quick Reference section data
export const QUICK_REFERENCE = {
  KEY_CONSIDERATIONS: [
    'Automatic VM renaming',
    'Persistent volumes without CDI',
    'Dual-boot operating system',
    'CBT snapshot limit',
    'QEMU-guest-agent installation',
    'EXT4 file system',
    'Measured Boot incompatibility',
  ],
  KEY_TERMINOLOGY: [
    'Cluster',
    'Container',
    'Cutover',
    'Disk decryption passphrases',
    'Hook',
    'Kubernetes',
    'Node',
    'Migration types (cold vs warm vs)',
    'Network map',
    'Persistent Volume (PV)',
    'Persistent Volume Claim (PVC)',
    'Project',
    'Provider',
    'Root device',
    'Storage map',
  ],
} as const;

// External links section data
// Keep in sync with ExternalLinksSection.tsx — "MTV performance recommendations"
// is commented out there pending AEM documentation migration.
export const EXTERNAL_LINKS = [
  'Documentation',
  'Get support',
  'Red Hat OpenShift Virtualization Administration I course',
] as const;

// MTV pages with learning experience (excludes Overview - tested in General smoke test)
export const MTV_PAGES = [
  { heading: 'Providers', name: 'Providers', resource: 'Provider' },
  { heading: 'Migration plans', name: 'Migration Plans', resource: 'Plan' },
  { heading: 'Network maps', name: 'Network Maps', resource: 'NetworkMap' },
  { heading: 'Storage maps', name: 'Storage Maps', resource: 'StorageMap' },
] as const;

// Topic cards shown in Tips and tricks drawer (from learningExperienceTopics)
export const TIPS_AND_TRICKS_TOPICS: TopicConfig[] = [
  {
    description: 'Step-by-step instructions for creating a provider.',
    minimumAccordions: 3,
    name: 'Creating a provider',
  },
  {
    description: 'Learn the best practices for seamlessly migrating your virtual machines.',
    minimumAccordions: 9,
    name: 'Migrating your virtual machines',
  },
  {
    description: 'Compare migration types to find the best fit for your needs.',
    minimumAccordions: 2,
    name: 'Choosing the right migration type',
  },
  {
    description: 'Define how virtual networks connect in the target environment during migration.',
    minimumAccordions: 3,
    name: 'Creating a network mapping',
  },
  {
    description: 'Set up storage to ensure smooth and efficient VM migration.',
    minimumAccordions: 3,
    name: 'Creating a storage mapping',
  },
  {
    description: 'Accelerate your VM migrations with expert recommendations.',
    minimumAccordions: 3,
    name: 'Optimizing migration speed',
  },
  {
    description: 'Get quick answers to common problems.',
    minimumAccordions: 5,
    name: 'Troubleshooting',
  },
];
