import type { KnipConfig } from 'knip';

export default {
  entry: [
    'src/overview/OverviewPage.tsx',
    'src/overview/hooks/OverviewContext.ts',
    'src/overview/hooks/useOverviewContext.ts',

    'src/providers/create/ProvidersCreatePage.tsx',
    'src/providers/list/ProvidersListPage.tsx',
    'src/providers/details/ProviderDetailsPage.tsx',
    'src/utils/types.ts',

    'src/modules/Plans/views/create/PlanCreatePage.tsx',
    'src/plans/create/PlanCreatePage.tsx',
    'src/plans/details/PlanDetailsNav.tsx',
    'src/plans/list/PlansListPage.tsx',

    'src/modules/NetworkMaps/views/list/NetworkMapsListPage.tsx',
    'src/modules/NetworkMaps/views/details/NetworkMapDetailsPage.tsx',
    'src/modules/NetworkMaps/yamlTemplates/defaultYamlTemplate.ts',
    'src/networkMaps/create/NetworkMapCreatePage.tsx',

    'src/modules/StorageMaps/views/list/StorageMapsListPage.tsx',
    'src/modules/StorageMaps/views/details/StorageMapDetailsPage.tsx',
    'src/modules/StorageMaps/yamlTemplates/defaultYamlTemplate.ts',
    'src/storageMaps/create/StorageMapCreatePage.tsx',
  ],
  ignore: ['i18next-parser.config.ts', 'testing/**', 'eslint.ide.config.ts'],
  ignoreBinaries: ['kubectl', 'test:e2e', 'playwright'],
  ignoreDependencies: [
    'ts-node',
    '@types/i18next', // Provides TypeScript types for i18next
    'monaco-editor', // Required peer dependency for @patternfly/react-code-editor
  ],
} satisfies KnipConfig;
