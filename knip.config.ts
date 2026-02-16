import type { KnipConfig } from 'knip';

export default {
  entry: [
    'src/overview/OverviewPage.tsx',
    'src/overview/hooks/OverviewContext.ts',
    'src/overview/hooks/useOverviewContext.ts',
    'src/overview/context/OverviewContext.ts',

    'src/onlineHelp/learningExperienceDrawer/context/LearningExperienceContext.ts',
    'src/onlineHelp/learningExperienceDrawer/context/useLearningExperienceContext.ts',

    'src/providers/create/ProvidersCreatePage.tsx',
    'src/providers/list/ProvidersListPage.tsx',
    'src/providers/details/ProviderDetailsPage.tsx',
    'src/utils/types.ts',

    'src/plans/create/PlanCreatePage.tsx',
    'src/plans/details/PlanDetailsNav.tsx',
    'src/plans/list/PlansListPage.tsx',

    'src/networkMaps/list/NetworkMapsListPage.tsx',
    'src/networkMaps/details/NetworkMapDetailsPage.tsx',
    'src/networkMaps/yamlTemplates/defaultYamlTemplate.ts',
    'src/networkMaps/create/NetworkMapCreatePage.tsx',

    'src/storageMaps/list/StorageMapsListPage.tsx',
    'src/storageMaps/details/StorageMapDetailsPage.tsx',
    'src/storageMaps/yamlTemplates/defaultYamlTemplate.ts',
    'src/storageMaps/create/StorageMapCreatePage.tsx',
  ],
  ignore: ['i18next-parser.config.ts', 'testing/**', 'eslint.ide.config.ts'],
  ignoreBinaries: ['kubectl', 'playwright'],
  ignoreDependencies: [
    'ts-node',
    '@types/i18next', // Provides TypeScript types for i18next
    'monaco-editor', // Required peer dependency for @patternfly/react-code-editor
    'react-redux', // Provided by OpenShift Console host at runtime
  ],
} satisfies KnipConfig;
