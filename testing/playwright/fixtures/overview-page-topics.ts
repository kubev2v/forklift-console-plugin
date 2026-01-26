import type { TopicConfig } from '../page-objects/OverviewPage';

// Provider types available in the "Creating a provider" topic
export const PROVIDER_TYPES = {
  VMWARE: 'VMware vSphere',
  OPENSHIFT_VIRT: 'OpenShift Virtualization',
  OPENSTACK: 'OpenStack',
  OVA: 'Open Virtual Appliances',
  RHV: 'Red Hat Virtualization',
} as const;

export const PROVIDER_TYPES_LIST = Object.values(PROVIDER_TYPES);

// Quick Reference section data
export const QUICK_REFERENCE = {
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
  KEY_CONSIDERATIONS: [
    'Automatic VM renaming',
    'Persistent volumes without CDI',
    'Dual-boot operating system',
    'CBT snapshot limit',
    'QEMU-guest-agent installation',
    'EXT4 file system',
    'Measured Boot incompatibility',
  ],
} as const;

// External links section data
export const EXTERNAL_LINKS = [
  'Documentation',
  'MTV performance recommendations',
  'Get support',
  'Red Hat OpenShift Virtualization Administration I course',
] as const;

// MTV pages with learning experience (excludes Overview - tested in General smoke test)
export const MTV_PAGES = [
  { name: 'Providers', resource: 'Provider', heading: 'Providers' },
  { name: 'Migration Plans', resource: 'Plan', heading: 'Migration plans' },
  { name: 'Network Maps', resource: 'NetworkMap', heading: 'Network maps' },
  { name: 'Storage Maps', resource: 'StorageMap', heading: 'Storage maps' },
] as const;

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
